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

const stopAWithParent = {
  ...stopA,
  parent_station: 2,
  parent_station_id: "stop_b",
};

const clearedStop = {
  ...stopAWithParent,
  parent_station: null,
  parent_station_id: null,
};

const levelOptions = {
  pagination: {
    current_page: 1,
    next_page_url: null,
    prev_page_url: null,
    total: 1,
    per_page: 1,
    last_page: 1,
    from: 1,
    to: 1,
  },
  results: [
    {
      id: 1,
      level_id: "level_0",
      level_index: 0,
      level_name: "Nivel 0",
    },
  ],
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

  it("leaves the parent station empty after clearing it and saving", () => {
    cy.intercept("GET", /\/api\/projects\/1\/stops\/\?sort=.*/, {
      pagination,
      results: [stopAWithParent, stopB],
    }).as("getStopsTable");
    cy.intercept("GET", /\/api\/projects\/1\/stops\/\?no_page=True/, [stopAWithParent, stopB]).as("getStopsMap");
    cy.intercept("GET", /\/api\/projects\/1\/stops\/$/, {
      pagination: { ...pagination, per_page: 2 },
      results: [stopAWithParent, stopB],
    }).as("getStopsOptions");
    cy.intercept("PATCH", "/api/projects/1/stops/1/", clearedStop).as("updateStop");

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
      cy.wait("@updateStop").its("request.body.parent_station").should("be.null");

      cy.get(".vuetable-body tr").eq(0).find("td").eq(10).invoke("text").should("match", /^\s*$/);
      cy.get("@getStopsTable.all").should("have.length", requestCountBeforeSave);
    });
  });

  it("shows updated values for input, number, simple select and FK fields", () => {
    cy.intercept("GET", /\/api\/projects\/1\/stops\/\?sort=.*/, {
      pagination,
      results: [stopA, stopB],
    }).as("getStopsTable");
    cy.intercept("GET", /\/api\/projects\/1\/stops\/\?no_page=True/, [stopA, stopB]).as("getStopsMap");
    cy.intercept("GET", /\/api\/projects\/1\/levels\/$/, levelOptions).as("getLevelsOptions");
    cy.intercept("PATCH", "/api/projects/1/stops/1/", {
      ...stopA,
      stop_name: "Paradero Alfa Editado",
      stop_lat: 18,
      wheelchair_boarding: 1,
      level: 1,
      level_id: "level_0",
    }).as("updateStop");

    cy.contains("Stops").click();
    cy.url().should("contain", "/project/1/stops");

    cy.contains("Table view").click();
    cy.get("@getStopsTable.all").should("have.length", 2);
    cy.get(".vuetable-body tr").should("have.length", 2);

    const row = () => cy.get(".vuetable-body tr").eq(0);

    row().find(".material-icons").contains("edit").click();
    row().find("td").eq(3).find("input").clear().type("Paradero Alfa Editado");
    row().find("td").eq(4).find("input").invoke("val", "18").trigger("input");

    row().find("td").eq(12).find(".multiselect__select").click();
    cy.contains(".multiselect__option", "Yes").click();

    row().find("td").eq(14).find(".multiselect__select").click();
    cy.wait("@getLevelsOptions");
    cy.contains(".multiselect__option", "level_0").click();

    cy.get("@getStopsTable.all").then((requests) => {
      const requestCountBeforeSave = requests.length;

      cy.get(".table-footer-buttons button").contains("Save").click();
      cy.wait("@updateStop").then((interception) => {
        expect(interception.request.body.stop_name).to.eq("Paradero Alfa Editado");
        expect(interception.request.body.stop_lat).to.eq(18);
        expect(interception.request.body.wheelchair_boarding).to.eq(1);
        expect(interception.request.body.level).to.eq(1);
      });

      row().find("td").eq(3).should("contain", "Paradero Alfa Editado");
      row().find("td").eq(4).invoke("text").should("match", /18/);
      row().find("td").eq(12).should("contain", "Yes");
      row().find("td").eq(14).should("contain", "level_0");
      cy.get("@getStopsTable.all").should("have.length", requestCountBeforeSave);
    });
  });
});
