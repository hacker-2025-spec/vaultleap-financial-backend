import { Controller, Get } from '@nestjs/common';

@Controller('')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'vaultleap-backend'
    };
  }

  @Get('test')
  test() {
    console.log('=============Test endpoint is working!=============');
    return {
      message: 'Test endpoint is working!',
      timestamp: new Date().toISOString()
    };
  }
} 