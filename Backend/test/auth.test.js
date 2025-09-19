const request = require('supertest');
const app = require('../server'); // Adjust path to your main server file
const { pool } = require('../config/database/connection');

describe('Authentication System Tests', () => {
  let adminToken;
  let userToken;
  let testUserId;

  // Test data
  const testUser = {
    email: 'test.user@example.com',
    password: 'TestPass123!',
    first_name: 'Test',
    last_name: 'User',
    department: 'Testing',
    position: 'Test Engineer'
  };

  const adminCredentials = {
    email: 'admin@metroexecucare.com',
    password: 'MetroAdmin123!'
  };

  beforeAll(async () => {
    // Ensure test database is seeded
    console.log('Setting up test environment...');
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await pool.execute('DELETE FROM users WHERE id = ?', [testUserId]);
    }
    await pool.end();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.role).toBe('executive'); // Default role
      expect(response.body.data.token).toBeDefined();

      // Store for cleanup
      testUserId = response.body.data.user.id;
      userToken = response.body.data.token;
    });

    test('should not register user with duplicate email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Email already exists');
    });

    test('should not register user with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Valid email is required');
    });

    test('should not register user with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'weak@example.com',
          password: '123'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toContain('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login admin user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(adminCredentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user.email).toBe(adminCredentials.email);
      expect(response.body.data.user.role).toBe('admin');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      adminToken = response.body.data.token;
    });

    test('should login regular user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    test('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: adminCredentials.email,
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });

    test('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });

    test('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid or expired token');
    });
  });

  describe('User Management - Admin Access', () => {
    test('should get all users as admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should not get all users as regular user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access denied. Admin role required.');
    });

    test('should update user status as admin', async () => {
      const response = await request(app)
        .put(`/api/users/${testUserId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'inactive' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deactivated successfully');
    });
  });

  describe('Password Security', () => {
    test('should change password successfully', async () => {
      const newPassword = 'NewTestPass123!';
      
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          current_password: testUser.password,
          new_password: newPassword
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully');

      // Test login with new password
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: newPassword
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });
  });

  describe('JWT Token Validation', () => {
    test('should validate JWT token structure', async () => {
      expect(adminToken).toBeDefined();
      expect(adminToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/);
    });

    test('should handle expired token gracefully', async () => {
      // This would require creating a token with immediate expiration
      // For now, we test the error handling structure
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});

module.exports = {
  testUser,
  adminCredentials
};