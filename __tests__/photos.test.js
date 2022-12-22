const request = require('supertest');
const app = require('./../app');
const { sequelize } = require('./../models/index');
const { queryInterface } = sequelize;
const { hash } = require('./../helpers/hash');
const { sign } = require('../helpers/jwt');

const user = {
  username: 'rio',
  email: 'rio@mail.com',
  password: 'password',
  createdAt: new Date(),
  updatedAt: new Date(),
};
const userToken = sign({ id: 1, email: user.email });
const userNotExistsToken = sign({ id: 99, email: 'notexists@mail.com' });

const defaultPhoto = {
  title: 'Default Photo',
  caption: 'Default Photo caption',
  image_url: 'http://image.com/defaultphoto.png',
  createdAt: new Date(),
  updatedAt: new Date(),
  UserId: 1,
};

const testPotos = [
  {
    title: 'photo 1',
    image_url: 'http://image.com/photo1.png',
  },
  {
    title: 'photo 2',
    image_url: 'http://image.com/photo2.png',
  },
];

beforeAll(async () => {
  await queryInterface.bulkDelete('Photos', null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  await queryInterface.bulkDelete('Users', null, {
    truncate: true,
    restartIdentity: true,
    cascade: true,
  });
  const hashedUser = { ...user };
  hashedUser.password = hash(hashedUser.password);
  await queryInterface.bulkInsert('Users', [hashedUser]);
  await queryInterface.bulkInsert('Photos', [defaultPhoto]);
});

afterAll(async () => {
  sequelize.close();
});

describe('GET /photos', () => {
  test('successfull to get photos', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(body.length).toBe(1);
    expect(body[0]).toEqual({
      id: 1,
      title: defaultPhoto.title,
      caption: defaultPhoto.caption,
      image_url: defaultPhoto.image_url,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      UserId: 1,
    });
  });
  test('should return HTTP status code 401 when no authorization', async () => {
    const { body } = await request(app).get('/photos').expect(401);
    expect(body.message).toMatch(/unauthorized/i);
  });
  test('should return HTTP status code 401 when no token provided', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', 'Bearer ')
      .expect(401);
    expect(body.message).toMatch(/invalid token/i);
  });
  test('should return HTTP status code 401 when no token provided', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', 'Bearer wrong.token.input')
      .expect(401);
    expect(body.message).toMatch(/invalid token/i);
  });
  test('should return HTTP status code 401 when user does not exist', async () => {
    const { body } = await request(app)
      .get('/photos')
      .set('Authorization', `Bearer ${userNotExistsToken}`)
      .expect(401);
    expect(body.message).toMatch(/unauthorized/i);
  });
});

describe('GET /Photo/:id', () => {
  test('successfull to get photo by id', async () => {
    const { body } = await request(app)
      .get('/photos/1')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(body).toEqual({
      id: 1,
      title: defaultPhoto.title,
      caption: defaultPhoto.caption,
      image_url: defaultPhoto.image_url,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      User: expect.objectContaining({
        id: 1,
        username: user.username,
        email: user.email,
      }),
    });
  });
  test('should return HTTP status code 401 when no authorization', async () => {
    const { body } = await request(app).get('/photos/1').expect(401);
    expect(body.message).toMatch(/unauthorized/i);
  });
  test('should return HTTP status code 401 when no token provided', async () => {
    const { body } = await request(app)
      .get('/photos/99')
      .set('Authorization', 'Bearer ')
      .expect(401);
    expect(body.message).toMatch(/invalid token/i);
  });
  test('should return HTTP status code 401 when no token provided', async () => {
    const { body } = await request(app)
      .get('/photos/99')
      .set('Authorization', 'Bearer wrong.token.input')
      .expect(401);
    expect(body.message).toMatch(/invalid token/i);
  });
  test('should return HTTP status code 401 when user does not exist', async () => {
    const { body } = await request(app)
      .get('/photos/1')
      .set('Authorization', `Bearer ${userNotExistsToken}`)
      .expect(401);
    expect(body.message).toMatch(/unauthorized/i);
  });
  test('should return HTTP status code 404 when not found', async () => {
    const { body } = await request(app)
      .get('/photos/99')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(404);
    expect(body.message).toMatch(/data not found/i);
  });
});

describe('POST /photo', () => {
  test('successfull to post photo', async () => {
    const { title, image_url } = testPotos[1];
    const { body } = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title, image_url })
      .expect(201);
    expect(body).toEqual({
      id: 2,
      title,
      caption:
        expect.stringContaining(title.toUpperCase()) &&
        expect.stringContaining(image_url),
      image_url,
      UserId: 1,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
  test('should return HTTP status code 400 when title is an empty string', async () => {
    const { image_url } = testPotos[1];
    const { body } = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '', image_url })
      .expect(400);
    expect(body.message).toContain('Title cannot be an empty string');
  });
  test('should return HTTP status code 400 when title is null', async () => {
    const { image_url } = testPotos[1];
    const { body } = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ image_url })
      .expect(400);
    expect(body.message).toContain('Title cannot be omitted');
  });
  test('should return HTTP status code 400 when imeage_url is an empty string', async () => {
    const { title } = testPotos[1];
    const { body } = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title, image_url: '' })
      .expect(400);
    expect(body.message).toContain('Image URL cannot be an empty string');
  });
  test('should return HTTP status code 400 when image_url is null', async () => {
    const { title } = testPotos[1];
    const { body } = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title })
      .expect(400);
    expect(body.message).toContain('Image URL cannot be omitted');
  });
  test('should return HTTP status code 400 when image_url is not a URL', async () => {
    const { title } = testPotos[1];
    const { body } = await request(app)
      .post('/photos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title, image_url: 'wrongurl' })
      .expect(400);
    expect(body.message).toContain('Wrong URL format');
  });
});
