describe('Admin Create User - Duplicate Email Error', () => {
  beforeEach(() => {
    // Login as admin first
    cy.visit('/auth');
    cy.get('input[type="email"]').type('admin@demo.com');
    cy.get('input[type="password"]').type('admin123');
    cy.get('button[type="submit"]').click();
    
    // Wait for redirect and navigate to users page
    cy.url().should('not.include', '/auth');
    cy.visit('/admin/users');
    cy.wait(1000);
  });

  it('should show duplicate email error message when creating user with existing email', () => {
    // Open create user modal
    cy.get('button').contains('Crear Usuario').click();
    
    // Fill form with existing email (admin@demo.com already exists)
    cy.get('input[id="email"]').type('admin@demo.com');
    cy.get('input[id="password"]').type('password123');
    cy.get('input[id="full_name"]').type('Test Duplicate User');
    
    // Select organizer role
    cy.get('input[id="organizer"]').check();
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Should show duplicate email error toast
    cy.contains('Este correo electrónico ya está registrado').should('be.visible');
    
    // Modal should still be open
    cy.get('[role="dialog"]').should('be.visible');
  });
});