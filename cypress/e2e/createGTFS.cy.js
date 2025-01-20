const TEST_GTFS_NAME = "cypress_test_gtfs";


before(() => {
    cy.login();
})

beforeEach(() => {
    cy.createGTFS();
    cy.getGTFSData();
    cy.postGTFSData();
    cy.visit("/myprojects");
})

describe("GTFS creation", () => {
    it("Create GTFS", () => {
        cy.contains("New project").click();
        cy.get("input[name=project-name]").type(TEST_GTFS_NAME);
        cy.get("#create-gtfs-button").click();

        cy.wait("@postProject");
        cy.wait("@getProject");
        cy.wait("@getTables");

        cy.url().should("contain", "/project/1/");

        cy.contains(TEST_GTFS_NAME);
    });

    it("Create agencies", ()=> {
        cy.wait("@getProject");
        cy.contains(TEST_GTFS_NAME).click();
        cy.url().should("contain", "/project/1/");
        cy.contains(TEST_GTFS_NAME);

        cy.contains("Agencies").click();
        cy.url().should("contain", "/project/1/agencies");

        cy.contains("Add row").click();

        const agency_fields = [
          "agency_id",
          "agency_name",
          "agency_url",
          "agency_lang",
          "agency_phone",
          "agency_fare_url",
          "agency_email",
        ];
        const agency_selectors = ["agency_timezone"];

        for (let field of agency_fields) {
            cy.get(`input[name=${field}]`).type("something");
        }
        for (let field of agency_selectors) {
            cy.get(`div[name=${field}]`).click()
            cy.get(`div[name=${field}]`).type("America/Santiago{enter}");
        }

        cy.contains("New entity").parent().parent().contains("Save").click();
    });
    /*
    it("Create calendars", ()=> {});
    it("Create stops", ()=> {});
    it("Create routes", ()=> {});
    it("Create shapes", ()=> {});
    it("Create trips", ()=> {});
    it("Create stop_times", ()=> {});
    it("Create frequencies", ()=> {});
    it("Create calendar dates",  ()=> {});

    it("Create fare attributes", ()=> {});
    it("Create fare rules ", ()=> {});
    it("Create transfers", ()=> {});
    it("Create pathways", ()=> {});
    it("Create levels", ()=> {});


    it("Delete GTFS", () => {
        cy.contains(TEST_GTFS_NAME).parent().get(".project-options").click();
        cy.contains(TEST_GTFS_NAME).parent().get(".delete").click();
    });
    */
})


