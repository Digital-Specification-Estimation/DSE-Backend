import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { VerificationService } from '../services/verification.service';
import {
  VerifyEmailDto,
  RequestVerificationDto,
  VerifyEmailResponseDto,
} from '../dto/verify-email.dto';

/**
 * @description
 * Handles email verification related operations including requesting verification codes
 * and verifying email addresses with the provided code.
 */
@ApiTags('verification')
@ApiBearerAuth()
@Controller('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  /**
   * Request a verification code to be sent to the provided email address
   * @param requestVerificationDto - The email address to send the verification code to
   * @returns Success message
   */
  @Post('request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request email verification code',
    description:
      'Sends a 6-digit verification code to the provided email address.',
  })
  @ApiBody({ type: RequestVerificationDto })
  @ApiOkResponse({
    description: 'Verification code sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Verification code sent successfully',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid email format or email sending failed',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid email format' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiTooManyRequestsResponse({
    description: 'Too many requests. Please try again later.',
  })
  async requestVerification(
    @Body() requestVerificationDto: RequestVerificationDto,
  ): Promise<{ message: string }> {
    await this.verificationService.generateAndSendCode(
      requestVerificationDto.email,
    );
    return { message: 'Verification code sent successfully' };
  }

  /**
   * Verify an email address with the provided verification code
   * @param verifyEmailDto - The email and verification code to verify
   * @returns Verification result with success status and message
   */
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email with code',
    description:
      'Verifies the provided verification code for the given email address.',
  })
  @ApiBody({ type: VerifyEmailDto })
  @ApiOkResponse({
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto,
    schema: {
      example: {
        success: true,
        message: 'Email verified successfully',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid or expired verification code',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Invalid or expired verification code',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many verification attempts. Please request a new code.',
  })
  async verifyEmail(
    @Body() verifyEmailDto: VerifyEmailDto,
  ): Promise<VerifyEmailResponseDto> {
    const isValid = await this.verificationService.verifyCode(
      verifyEmailDto.email,
      verifyEmailDto.code,
    );

    if (!isValid) {
      return {
        success: false,
        message: 'Invalid or expired verification code',
      };
    }

    // Here you can add additional logic like marking the email as verified in your user database
    // await this.userService.markEmailAsVerified(verifyEmailDto.email);

    return {
      success: true,
      message: 'Email verified successfully',
    };
  }
}
