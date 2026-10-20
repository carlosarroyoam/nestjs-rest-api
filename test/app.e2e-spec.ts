import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppInfo } from '@/app.controller';
import { AppModule } from '@/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect((response) => {
        const body = response.body as AppInfo;

        expect(body).toMatchObject({
          name: 'nestjs-rest-api',
          description: 'Nestjs Rest Api',
          version: '0.0.1',
        });
        expect(body.documentation).toMatch(/^http:\/\/127\.0\.0\.1:\d+\/docs$/);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
