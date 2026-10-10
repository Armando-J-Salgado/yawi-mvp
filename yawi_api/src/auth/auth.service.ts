import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../customers/entities/customer.entity';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import {
  AuthenticatedUser,
  JwtPayload,
} from './interfaces/jwt-payload.interface';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET must be configured in environment variables');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const normalizedEmail = loginDto.email.trim().toLowerCase();

    const customer = await this.customerRepository
      .createQueryBuilder('customer')
      .where('LOWER(TRIM(customer.email)) = :email', { email: normalizedEmail })
      .addSelect('customer.password')
      .getOne();

    if (!customer || customer.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      customer.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: customer.id,
      userType: 'customer',
      email: customer.email,
    };

    const token = this.jwtService.sign(payload);
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1d');

    return {
      access_token: token,
      token_type: 'Bearer',
      expires_in: expiresIn,
      user: {
        id: customer.id,
        userType: 'customer',
        email: customer.email,
        name: customer.name,
        lastname: customer.lastname,
      },
    };
  }

  async validateTokenPayload(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload || !payload.sub || !UUID_REGEX.test(payload.sub)) {
      throw new UnauthorizedException('Token inválido');
    }

    if (payload.userType !== 'customer') {
      throw new UnauthorizedException('Tipo de usuario inválido');
    }

    if (!payload.email || typeof payload.email !== 'string') {
      throw new UnauthorizedException('Token inválido');
    }

    const customer = await this.customerRepository.findOne({
      where: { id: payload.sub },
    });

    if (!customer || customer.deletedAt) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }

    return {
      id: customer.id,
      userType: 'customer',
      email: customer.email,
      name: customer.name,
      lastname: customer.lastname,
    };
  }
}
