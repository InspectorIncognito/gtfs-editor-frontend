import { TEST_GTFS_NAME } from "../../support/utils";

const stopA = {
  id: 1,
  stop_id: "stop_a",
  stop_code: "A",
  stop_name: "Paradero Alfa",
  stop_lat: -17.99,
  stop_lon: -70.24,
  stop_url: null,
  stop_desc: null,
  zone_id: null,
  location_type: null,
  parent_station: null,
  parent_station_id: null,
  stop_timezone: null,
  wheelchair_boarding: null,
  level: null,
  level_id: null,
  platform_code: null,
};

const stopB = {
  ...stopA,
  id: 2,
  stop_id: "stop_b",
  stop_code: "B",
  stop_name: "Paradero Beta",
};

const pagination = {
  current_page: 1,
  next_page_url: null,
  prev_page_url: null,
  total: 2,
  per_page: 10,
  last_page: 1,
  from: 1,
  to: 2,
};

before(() => {
  cy.login();
});

beforeEach(() => {
  cy.createGTFS();
  cy.postGTFSData();
  cy.visit("/myprojects");
  cy.contains(TEST_GTFS_NAME).click();
});

describe("GTFS Stops update", () => {
  it("shows the new parent station after saving without reloading the table", () => {
    cy.intercept("GET", /\/api\/projects\/1\/stops\/\?sort=.*/, {
      pagination,
      results: [stopA, stopB],
    }).as("getStopsTable");
    cy.intercept("GET", /\/api\/projects\/1\/stops\/\?no_page=True/, [stopA, stopB]).as("getStopsMap");
    cy.intercept("GET", /\/api\/projects\/1\/stops\/$/, {
      pagination: { ...pagination, per_page: 2 },
      results: [stopA, stopB],
    }).as("getStopsOptions");
    cy.intercept("PATCH", "/api/projects/1/stops/1/", {
      ...stopA,
      parent_station: 2,
      parent_station_id: "stop_b",
    }).as("updateStop");

    cy.contains("Stops").click();
    cy.url().should("contain", "/project/1/stops");

    cy.contains("Table view").click();
    cy.get("@getStopsTable.all").should("have.length", 2);
    cy.get(".vuetable-body tr").should("have.length", 2);

    cy.get(".vuetable-body tr").eq(0).find(".material-icons").contains("edit").click();
    cy.get(".vuetable-body tr").eq(0).find(".multiselect__select").first().click();
    cy.wait("@getStopsOptions");
    cy.contains(".multiselect__option", "stop_b").click();

    cy.get("@getStopsTable.all").then((requests) => {
      const requestCountBeforeSave = requests.length;

      cy.get(".table-footer-buttons button").contains("Save").click();
      cy.wait("@updateStop").its("request.body.parent_station").should("eq", 2);

      cy.get(".vuetable-body tr").eq(0).find("td").eq(10).should("contain", "stop_b");
      cy.get("@getStopsTable.all").should("have.length", requestCountBeforeSave);
    });
  });
});
