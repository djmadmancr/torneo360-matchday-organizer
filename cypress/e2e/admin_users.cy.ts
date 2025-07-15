describe('Admin Users Management E2E', () => {
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

  it('should create a new user', () => {
    // Click create user button
    cy.get('[data-testid="create-user-button"]').click();
    
    // Fill out the form
    cy.get('[data-testid="user-email-input"]').type('qauser@demo.com');
    cy.get('[data-testid="user-password-input"]').type('qa123456');
    cy.get('[data-testid="user-name-input"]').type('QA Test User');
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="referee"]').click();
    
    // Submit the form
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Wait for success toast
    cy.get('[data-testid="toast-success"]', { timeout: 10000 }).should('be.visible');
    
    // Verify user was created in the table
    cy.get('[data-testid="users-table"]').should('contain', 'qauser@demo.com');
    cy.get('[data-testid="users-table"]').should('contain', 'QA Test User');
    cy.get('[data-testid="users-table"]').should('contain', 'referee');
  });

  it('should update user role', () => {
    // Find the test user and click edit
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .find('[data-testid="edit-user-button"]')
      .click();
    
    // Change role to organizer
    cy.get('[data-testid="user-role-select"]').click();
    cy.get('[data-value="organizer"]').click();
    
    // Submit the form
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Verify role was updated
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .should('contain', 'organizer');
  });

  it('should deactivate and reactivate user', () => {
    // Find the test user and toggle status
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .find('[data-testid="toggle-user-status-button"]')
      .click();
    
    // Confirm deactivation
    cy.get('[data-testid="confirm-toggle-button"]').click();
    
    // Verify user is deactivated
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .should('contain', 'Inactivo');
    
    // Reactivate user
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .find('[data-testid="toggle-user-status-button"]')
      .click();
    
    // Confirm reactivation
    cy.get('[data-testid="confirm-toggle-button"]').click();
    
    // Verify user is active
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .should('contain', 'Activo');
  });

  it('should reset user password', () => {
    // Find the test user and reset password
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .find('[data-testid="reset-password-button"]')
      .click();
    
    // Confirm password reset
    cy.get('[data-testid="confirm-reset-button"]').click();
    
    // Verify success message
    cy.get('[data-testid="toast-message"]').should('contain', 'Contraseña restablecida');
  });

  it('should delete user', () => {
    // Find the test user and delete
    cy.get('[data-testid="users-table"]')
      .contains('testuser@demo.com')
      .parent()
      .find('[data-testid="delete-user-button"]')
      .click();
    
    // Confirm deletion
    cy.get('[data-testid="confirm-delete-button"]').click();
    
    // Verify user was deleted
    cy.get('[data-testid="users-table"]').should('not.contain', 'testuser@demo.com');
  });

  it('should handle API errors gracefully', () => {
    // Intercept API calls to simulate errors
    cy.intercept('POST', '**/admin-create-user', { statusCode: 500, body: { error: 'Server error' } });
    
    // Try to create a user
    cy.get('[data-testid="create-user-button"]').click();
    cy.get('[data-testid="user-email-input"]').type('error@demo.com');
    cy.get('[data-testid="user-password-input"]').type('test1234');
    cy.get('[data-testid="user-name-input"]').type('Error User');
    cy.get('[data-testid="submit-user-button"]').click();
    
    // Verify error message is shown
    cy.get('[data-testid="error-message"]').should('contain', 'Server error');
  });

  it('should filter users by search term', () => {
    // Enter search term
    cy.get('[data-testid="search-input"]').type('admin');
    
    // Verify filtered results
    cy.get('[data-testid="users-table"]').should('contain', 'admin@demo.com');
    cy.get('[data-testid="users-table"]').should('not.contain', 'testuser@demo.com');
    
    // Clear search
    cy.get('[data-testid="search-input"]').clear();
    
    // Verify all users are shown again
    cy.get('[data-testid="users-table"]').should('contain', 'admin@demo.com');
  });

  it('should filter users by role', () => {
    // Select role filter
    cy.get('[data-testid="role-filter-select"]').click();
    cy.get('[data-value="admin"]').click();
    
    // Verify only admin users are shown
    cy.get('[data-testid="users-table"]').should('contain', 'admin@demo.com');
    
    // Reset filter
    cy.get('[data-testid="role-filter-select"]').click();
    cy.get('[data-value="all"]').click();
  });
});