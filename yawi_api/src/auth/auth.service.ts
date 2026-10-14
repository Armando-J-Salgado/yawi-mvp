import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Customer } from '../customers/entities/customer.entity';
import { Vendor } from '../vendors/entities/vendor.entity';
import { LoginDto } from './dto/login.dto';
import { VendorLoginDto } from './dto/vendor-login.dto';
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
    @InjectRepository(Vendor)
    private readonly vendorRepository: Repository<Vendor>,
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

  async vendorLogin(
    loginDto: VendorLoginDto,
  ): Promise<AuthResponseDto> {
    const identifier = loginDto.identifier.trim();
    const vendor = await this.vendorRepository
      .createQueryBuilder('vendor')
      .where(
        'TRIM(vendor.username) = :identifier OR TRIM(vendor.DUI) = :identifier',
        { identifier },
      )
      .addSelect('vendor.password')
      .getOne();

    if (!vendor || vendor.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      vendor.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: vendor.id,
      userType: 'vendor',
      username: vendor.username,
    };

    return {
      access_token: this.jwtService.sign(payload),
      token_type: 'Bearer',
      expires_in: this.configService.get<string>('JWT_EXPIRES_IN', '1d'),
      user: {
        id: vendor.id,
        userType: 'vendor',
        username: vendor.username,
        name: vendor.name,
        surname: vendor.surname,
        lastname: vendor.lastname,
        second_lastname: vendor.second_lastname,
      },
    };
  }

  async validateTokenPayload(payload: JwtPayload): Promise<AuthenticatedUser> {
    if (!payload || !payload.sub || !UUID_REGEX.test(payload.sub)) {
      throw new UnauthorizedException('Token inválido');
    }

    if (payload.userType === 'customer') {
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

    if (!payload.username || typeof payload.username !== 'string') {
      throw new UnauthorizedException('Token inválido');
    }
    const vendor = await this.vendorRepository.findOne({
      where: { id: payload.sub },
    });
    if (!vendor || vendor.deletedAt) {
      throw new UnauthorizedException('Usuario no encontrado o inactivo');
    }
    return {
      id: vendor.id,
      userType: 'vendor',
      username: vendor.username,
      name: vendor.name,
      surname: vendor.surname,
      lastname: vendor.lastname,
      second_lastname: vendor.second_lastname,
    };
  }
}
