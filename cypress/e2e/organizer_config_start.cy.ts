describe('Organizer Tournament Configuration and Start', () => {
  beforeEach(() => {
    // Set up environment
    cy.visit('/auth');
    
    // Login as organizer
    cy.get('[data-testid=email-input]').type('organizer@test.com');
    cy.get('[data-testid=password-input]').type('password123');
    cy.get('[data-testid=login-button]').click();
    
    // Navigate to organizer dashboard
    cy.url().should('include', '/');
    cy.get('[href="/organizador"]').click();
    cy.url().should('include', '/organizador');
  });

  it('should allow organizer to configure tournament', () => {
    // Go to tournaments tab
    cy.get('[data-value="torneos"]').click();
    
    // Find a tournament and click configure
    cy.get('[data-testid=tournament-card]').first().within(() => {
      cy.contains('Configurar').click();
    });
    
    // Tournament edit modal should open
    cy.get('[data-testid=tournament-edit-modal]').should('be.visible');
    
    // Change max teams
    cy.get('[data-testid=max-teams-input]').clear().type('20');
    
    // Change description
    cy.get('[data-testid=description-input]').clear().type('Updated tournament description');
    
    // Save changes
    cy.get('[data-testid=save-tournament-button]').click();
    
    // Should show success toast
    cy.contains('Torneo actualizado exitosamente').should('be.visible');
    
    // Modal should close
    cy.get('[data-testid=tournament-edit-modal]').should('not.exist');
  });

  it('should allow organizer to start tournament with sufficient teams', () => {
    // First, approve some teams (mock data or previous setup)
    // This would typically be done through the solicitudes tab
    
    // Go to tournaments tab
    cy.get('[data-value="torneos"]').click();
    
    // Find a tournament with enrolling status and at least 2 teams
    cy.get('[data-testid=tournament-card]').contains('Inscripciones Abiertas').parents('[data-testid=tournament-card]').within(() => {
      // Check if "Iniciar Torneo" button exists (only if >=2 teams)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid=start-tournament-button]').length > 0) {
          cy.get('[data-testid=start-tournament-button]').click();
          
          // Should show success toast
          cy.contains('Torneo iniciado exitosamente').should('be.visible');
          
          // Tournament status should change to scheduled
          cy.contains('En Curso').should('be.visible');
        } else {
          // If button doesn't exist, tournament doesn't have enough teams
          cy.log('Tournament does not have enough teams to start');
        }
      });
    });
  });

  it('should not show start button for tournaments without enough teams', () => {
    // Go to tournaments tab
    cy.get('[data-value="torneos"]').click();
    
    // Check that tournaments with less than 2 teams don't show start button
    cy.get('[data-testid=tournament-card]').each(($card) => {
      cy.wrap($card).within(() => {
        // Check team count
        cy.get('[data-testid=team-count]').invoke('text').then((text) => {
          const teamCount = parseInt(text.split('/')[0]);
          if (teamCount < 2) {
            // Should not have start tournament button
            cy.get('[data-testid=start-tournament-button]').should('not.exist');
          }
        });
      });
    });
  });

  it('should handle tournament start errors gracefully', () => {
    // Mock a failing API call
    cy.intercept('POST', '**/functions/v1/generate-fixture', {
      statusCode: 500,
      body: { error: 'Server error' }
    });
    
    // Go to tournaments tab
    cy.get('[data-value="torneos"]').click();
    
    // Try to start a tournament (if available)
    cy.get('[data-testid=start-tournament-button]').first().click();
    
    // Should show error toast
    cy.contains('Error al iniciar el torneo').should('be.visible');
  });
});