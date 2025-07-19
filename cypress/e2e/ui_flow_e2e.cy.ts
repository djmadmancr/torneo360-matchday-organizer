describe('UI Flow End-to-End Tests', () => {
  beforeEach(() => {
    // Mock user login as team admin
    cy.visit('/');
    // Add authentication setup here if needed
  });

  it('should create a team and manage home fields', () => {
    // Navigate to team section
    cy.get('[data-testid="team-section"]').click();
    
    // Create a new team
    cy.get('[data-testid="create-team-button"]').click();
    cy.get('[data-testid="team-name-input"]').type('Test Team FC');
    cy.get('[data-testid="team-city-input"]').type('Test City');
    cy.get('[data-testid="create-team-submit"]').click();
    
    // Verify team was created
    cy.contains('Test Team FC').should('be.visible');
    
    // Add home field
    cy.get('[data-testid="manage-fields-button"]').click();
    cy.get('[data-testid="field-name-input"]').type('Test Stadium');
    cy.get('[data-testid="field-address-input"]').type('123 Test Street');
    cy.get('[data-testid="add-field-button"]').click();
    
    // Verify field was added
    cy.contains('Test Stadium').should('be.visible');
  });

  it('should create and configure a tournament', () => {
    // Navigate to organizer section
    cy.get('[data-testid="organizer-section"]').click();
    
    // Create tournament
    cy.get('[data-testid="create-tournament-button"]').click();
    cy.get('[data-testid="tournament-name-input"]').type('Test Tournament');
    cy.get('[data-testid="tournament-coverage-select"]').click();
    cy.get('[data-value="local"]').click();
    cy.get('[data-testid="create-tournament-submit"]').click();
    
    // Configure tournament
    cy.get('[data-testid="configure-tournament-button"]').click();
    cy.get('[data-testid="tournament-max-teams-input"]').clear().type('8');
    cy.get('[data-testid="save-tournament-changes"]').click();
    
    // Verify changes were saved
    cy.contains('Torneo actualizado exitosamente').should('be.visible');
  });

  it('should start tournament and assign referee', () => {
    // Assume tournament exists with teams
    cy.get('[data-testid="start-tournament-button"]').click();
    cy.get('[data-testid="confirm-start-tournament"]').click();
    
    // Verify tournament started
    cy.contains('¡Torneo iniciado!').should('be.visible');
    
    // Navigate to fixtures
    cy.get('[data-testid="fixtures-tab"]').click();
    
    // Assign referee to first match
    cy.get('[data-testid="referee-select"]').first().click();
    cy.get('[data-testid="referee-option"]').first().click();
    
    // Verify referee assigned
    cy.contains('Fiscal asignado exitosamente').should('be.visible');
  });

  it('should change venue for home team match', () => {
    // Navigate to fixtures as home team
    cy.get('[data-testid="fixtures-section"]').click();
    
    // Find match where team is home
    cy.get('[data-testid="home-match"]').first().within(() => {
      cy.get('[data-testid="venue-select"]').click();
      cy.get('[data-testid="venue-option"]').first().click();
    });
    
    // Verify venue changed
    cy.contains('Cancha del partido actualizada').should('be.visible');
  });
});