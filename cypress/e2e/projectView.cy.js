beforeEach(() => {
  // set the token in local storage and mock the verify request
  cy.setDummyToken();
  cy.mockLoginRequest();
  cy.visit("/myprojects");
});

describe("Projects view", () => {
  it("Create a project", () => {
    cy.contains("New project").click();
  })
})