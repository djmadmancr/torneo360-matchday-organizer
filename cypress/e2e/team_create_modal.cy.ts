describe('Team Create Modal', () => {
  beforeEach(() => {
    // Visit the team page
    cy.visit('/equipo')
  })

  it('should open modal when clicking "Crear primer equipo" button', () => {
    cy.log('🧪 Testing team create modal functionality')
    
    // Check if we see the "no teams" message
    cy.contains('No tienes equipos creados').should('be.visible')
    cy.contains('Crear primer equipo').should('be.visible')
    
    // Click the create team button
    cy.contains('Crear primer equipo').click()
    
    // Modal should be visible
    cy.get('[role="dialog"]').should('be.visible')
    cy.contains('Crear Nuevo Equipo').should('be.visible')
    
    // Fill the form
    cy.get('input[id="name"]').type('Real Beta FC')
    
    // Submit the form
    cy.contains('button', 'Crear Equipo').click()
    
    // Should show success message
    cy.contains('creado exitosamente').should('be.visible')
    
    // Modal should close
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('should show team list after creating a team', () => {
    cy.log('🧪 Testing team list display after creation')
    
    // If there are teams, should show the team grid
    cy.get('body').then($body => {
      if ($body.text().includes('No tienes equipos creados')) {
        // Create a team first
        cy.contains('Crear primer equipo').click()
        cy.get('input[id="name"]').type('Test Team')
        cy.contains('button', 'Crear Equipo').click()
        cy.wait(1000)
      }
      
      // Should show "Mis Equipos" section
      cy.contains('Mis Equipos').should('be.visible')
    })
  })
})