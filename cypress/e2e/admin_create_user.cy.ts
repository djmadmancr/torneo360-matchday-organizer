describe('Admin Create User', () => {
  beforeEach(() => {
    // Login as admin
    cy.visit('/auth');
    cy.get('input[type="email"]').type('admin@demo.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();
    
    // Navigate to admin users page
    cy.url().should('not.include', '/auth');
    cy.visit('/admin/users');
  });

  it('should successfully create a new referee user', () => {
    // Click create user button
    cy.get('[data-testid="create-user-button"]').click();
    
    // Fill out the form
    cy.get('#email').type('qauser@demo.com');
    cy.get('#password').type('qa123456789'); // 8+ characters
    cy.get('#full_name').type('QA Test User');
    
    // Select referee role
    cy.get('#referee').check();
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for success toast
    cy.contains('Usuario creado exitosamente').should('be.visible');
    
    // Verify user appears in table
    cy.contains('qauser@demo.com').should('be.visible');
    cy.contains('QA Test User').should('be.visible');
  });

  it('should handle server errors gracefully', () => {
    // Intercept the admin-create-user function call to simulate error
    cy.intercept('POST', '**/functions/v1/admin-create-user', {
      statusCode: 400,
      body: { error: 'Email already exists' }
    }).as('createUserError');
    
    // Click create user button
    cy.get('[data-testid="create-user-button"]').click();
    
    // Fill out the form
    cy.get('#email').type('error@demo.com');
    cy.get('#password').type('password123');
    cy.get('#full_name').type('Error User');
    cy.get('#referee').check();
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Wait for the request
    cy.wait('@createUserError');
    
    // Check that error message is displayed
    cy.contains('Email already exists').should('be.visible');
  });

  it('should validate required fields', () => {
    // Click create user button
    cy.get('[data-testid="create-user-button"]').click();
    
    // Try to submit without filling required fields
    cy.get('button[type="submit"]').click();
    
    // Check validation messages appear
    cy.get('#email:invalid').should('exist');
    cy.get('#password:invalid').should('exist');
    cy.get('#full_name:invalid').should('exist');
  });

  it('should verify created user data in users table', () => {
    // Create user first
    cy.get('[data-testid="create-user-button"]').click();
    cy.get('#email').type('verify@demo.com');
    cy.get('#password').type('verify123456');
    cy.get('#full_name').type('Verify User');
    cy.get('#organizer').check();
    cy.get('button[type="submit"]').click();
    
    // Wait for success
    cy.contains('Usuario creado exitosamente').should('be.visible');
    
    // Verify user appears in table with correct data
    cy.get('table').within(() => {
      cy.contains('tr', 'verify@demo.com').within(() => {
        cy.contains('Verify User').should('be.visible');
        cy.contains('organizer').should('be.visible');
        cy.contains('Activo').should('be.visible');
      });
    });
  });
});