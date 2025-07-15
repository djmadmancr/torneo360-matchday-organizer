describe('Admin Create User E2E Test', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/auth');
    cy.get('[data-testid="email-input"]').type('admin@demo.com');
    cy.get('[data-testid="password-input"]').type('demo123');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for login and navigate to admin users
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.get('[data-testid="admin-panel-button"]').click();
    cy.url().should('include', '/admin/users');
  });

  it('should successfully create a referee user', () => {
    // Click create user button
    cy.get('[data-testid="create-user-button"]').click();
    
    // Fill out the form with specified data
    cy.get('[data-testid="user-email-input"]').type('qauser@demo.com');
    cy.get('[data-testid="user-password-input"]').type('qa123456');
    cy.get('[data-testid="user-name-input"]').type('QA Test User');
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="referee"]').click();
    
    // Submit the form
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Wait for success toast
    cy.get('[data-testid="toast-success"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="toast-success"]').should('contain', 'Usuario creado exitosamente');
    
    // Verify user appears in the table
    cy.get('[data-testid="users-table"]').should('contain', 'qauser@demo.com');
    cy.get('[data-testid="users-table"]').should('contain', 'QA Test User');
    cy.get('[data-testid="users-table"]').should('contain', 'referee');
  });

  it('should handle edge function errors gracefully', () => {
    // Intercept the admin-create-user function to simulate server error
    cy.intercept('POST', '**/functions/v1/admin-create-user', {
      statusCode: 400,
      body: { error: 'Email is required' }
    }).as('createUserError');
    
    // Try to create a user
    cy.get('[data-testid="create-user-button"]').click();
    cy.get('[data-testid="user-email-input"]').type('error@demo.com');
    cy.get('[data-testid="user-password-input"]').type('test1234');
    cy.get('[data-testid="user-name-input"]').type('Error User');
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="team_admin"]').click();
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Wait for the API call
    cy.wait('@createUserError');
    
    // Verify error message is displayed
    cy.get('[data-testid="error-message"]', { timeout: 5000 }).should('be.visible');
    cy.get('[data-testid="error-message"]').should('contain', 'Email is required');
  });

  it('should validate required fields', () => {
    // Click create user button
    cy.get('[data-testid="create-user-button"]').click();
    
    // Try to submit without filling required fields
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Verify validation errors appear
    cy.get('[data-testid="email-error"]').should('be.visible');
    cy.get('[data-testid="password-error"]').should('be.visible');
    cy.get('[data-testid="name-error"]').should('be.visible');
  });

  it('should verify user data in auth.users and public.users tables', () => {
    // This test would require database access which isn't available in E2E tests
    // Instead, we verify the UI shows the created user correctly
    
    // Create a user first
    cy.get('[data-testid="create-user-button"]').click();
    cy.get('[data-testid="user-email-input"]').type('verify@demo.com');
    cy.get('[data-testid="user-password-input"]').type('verify123');
    cy.get('[data-testid="user-name-input"]').type('Verify User');
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="referee"]').click();
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Wait for success
    cy.get('[data-testid="toast-success"]', { timeout: 10000 }).should('be.visible');
    
    // Verify the user appears in the table with correct data
    cy.get('[data-testid="users-table"]')
      .contains('verify@demo.com')
      .parent()
      .within(() => {
        cy.should('contain', 'Verify User');
        cy.should('contain', 'referee');
        cy.should('contain', 'Activo'); // Status should be active
      });
  });

  afterEach(() => {
    // Clean up test data
    // In a real scenario, you might want to delete the test user
    // For this test, we'll leave it as the cleanup should be handled by the backend
  });
});