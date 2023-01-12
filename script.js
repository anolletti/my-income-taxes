let grossIncome, label, provDataYear;
let provBracket = [];
let actualProvBracket = [];
let provBracketPerc = [];
let totalDeductions = 0;
let alreadySubmitted = false;
let provDataChart = null;
let fedDataChart = null;
let netIncomeChart = null;
let language = "en";
let provinceSelected = false;
let province = "NB";
const provinceList = document.getElementById("provinceList");
const currencyFr = "fr-CA";
const currencyEn = "en-CA";
let tax_data_js = {
  NL: {
    name: "Newfoundland and Labrador",
    brackets: [39147, 78294, 139780, 195693, 250000, 500000, 1000000],
    rates: [0.087, 0.145, 0.158, 0.178, 0.198, 0.208, 0.213, 0.218],
  },
  PE: {
    name: "Prince Edward Island",
    brackets: [31984, 63969],
    rates: [0.098, 0.138, 0.167],
  },
  NS: {
    name: "Nova Scotia",
    brackets: [29590, 59180, 93000, 150000],
    rates: [0.0879, 0.1495, 0.1667, 0.175, 0.21],
  },
  NB: {
    name: "New Brunswick",
    brackets: [44887, 89775, 145955, 166280],
    rates: [0.094, 0.1482, 0.1652, 0.1784, 0.203],
  },
  QC: {
    name: "Quebec",
    brackets: [46295, 92580, 112655],
    rates: [0.15, 0.2, 0.24, 0.2575],
  },
  ON: {
    name: "Ontario",
    brackets: [46226, 92454, 150000, 220000],
    rates: [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
  },
  MB: {
    name: "Manitoba",
    brackets: [34431, 74416],
    rates: [0.108, 0.1275, 0.174],
  },
  SK: {
    name: "Saskatchewan",
    brackets: [46773, 133638],
    rates: [0.105, 0.125, 0.145],
  },
  AB: {
    name: "Alberta",
    brackets: [131220, 157464, 209952, 314928],
    rates: [0.1, 0.12, 0.13, 0.14, 0.15],
  },
  BC: {
    name: "British Columbia",
    brackets: [43070, 86141, 98901, 120094, 162832, 227091],
    rates: [0.0506, 0.077, 0.105, 0.1229, 0.147, 0.168, 0.205],
  },
  YT: {
    name: "Yukon",
    brackets: [50197, 100392, 155625, 500000],
    rates: [0.064, 0.09, 0.109, 0.128, 0.15],
  },
  NT: {
    name: "Northwest Territories",
    brackets: [45462, 90927, 147826],
    rates: [0.059, 0.086, 0.122, 0.1405],
  },
  NU: {
    name: "Nunavut",
    brackets: [47862, 95724, 155625],
    rates: [0.04, 0.07, 0.09, 0.115],
  },
};

// Override hover states for mobile touch
$("button").on("touchstart", function () {
  $(this).removeClass("mobileHoverFix");
});
$("button").on("touchend", function () {
  $(this).addClass("mobileHoverFix");
});

// Setting Province List
provinceList.innerHTML = `
    <option value="none" class="text-secondary" selected>- Province -</option>`;

for (let i = 0; i < Object.keys(tax_data_js).length; i++) {
  provinceList.innerHTML += `<option value="${Object.keys(tax_data_js)[i]}">${
    Object.keys(tax_data_js)[i]
  }</option>`;
}

provinceList.addEventListener("change", function (e) {
  if (e.target.value != "none") {
    province = e.target.value;
    provinceList.classList.remove("text-secondary");
    provinceSelected = true;
    selectData(province);
    if (grossIncome) {
      onSubmit();
    }
  } else {
    provinceList.classList.add("text-secondary");
    provinceSelected = false;
  }
});

// PROVINCIAL TAX DATA
function selectData(province) {
  provDataYear = 2022;
  provBracket = tax_data_js[province]["brackets"];
  actualProvBracket = [];
  provBracketPerc = tax_data_js[province]["rates"];
}

selectData(province);

// 2022 FEDERAL TAX DATA
let fedDataYear = 2022;
let fedBracket = [50197, 100392, 155625, 221708];
let actualFedBracket = [];
let fedBracketPerc = [0.15, 0.205, 0.26, 0.29, 0.33];
let eiRate = 0.0158;
let eiMax = 952.74;
let cppRate = 0.057;
let cppMax = 3499.8;

$('[lang="fr"]').hide();

const languageButton = document.getElementById("languageButton");
languageButton.innerHTML = `<i class="fa-solid fa-earth-americas"></i> FR`;
languageButton.addEventListener("click", function () {
  $('[lang="fr"]').toggle();
  $('[lang="en"]').toggle();

  if (language == "en") {
    languageButton.innerHTML = `<i class="fa-solid fa-earth-americas"></i> EN`;
    language = "fr";
    setPopovers();
    document
      .getElementById("grossIncomeField")
      .setAttribute("placeholder", "Salaire brut");
  } else if (language == "fr") {
    languageButton.innerHTML = `<i class="fa-solid fa-earth-americas"></i> FR`;
    language = "en";
    setPopovers();
    document
      .getElementById("grossIncomeField")
      .setAttribute("placeholder", "Gross Income");
  }
  grossIncome && onSubmit();
});

document
  .getElementById("section1reveal")
  .addEventListener("click", function () {
    document.getElementById("1").classList.remove("d-none");
  });

// Create our number formatter.

function currencyFormatter() {
  let currency;
  language == "fr" ? (currency = currencyFr) : (currency = currencyEn);

  formatter = new Intl.NumberFormat(currency, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
  return formatter;
}

function numOnly(str) {
  let res = str.replace(/\D/g, "");
  return Number(res);
}

function formatAsPercent(num) {
  return new Intl.NumberFormat("default", {
    style: "percent",
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);
}

function addDeductions() {
  totalDeductions = 0;
  let e = document.getElementsByName("deductions");
  for (let i = 0; i < e.length; i++) {
    if (e[i].value != null) {
      totalDeductions += numOnly(e[i].value);
    }
  }
  return totalDeductions;
}

function clearDeductions() {
  let e = document.getElementsByName("deductions");
  for (let i = 0; i < e.length; i++) {
    e[i].value = "";
  }
}
document
  .getElementById("clearDeductions")
  .addEventListener("click", clearDeductions);

const nameInnerText = (elementName, innerContent) => {
  const nameElements = document.getElementsByName(elementName);
  for (let i = 0; i < nameElements.length; i++) {
    nameElements[i].innerHTML += innerContent;
  }
};

const removeInnerText = (elementName) => {
  const nameElements = document.getElementsByName(elementName);
  for (let i = 0; i < nameElements.length; i++) {
    nameElements[i].innerHTML = "";
  }
};

const saveDeductions = document.getElementById("saveDeductions");
saveDeductions.addEventListener("click", addDeductions);
saveDeductions.addEventListener("click", function () {
  if (alreadySubmitted) {
    onSubmit();
  }
});

function eiCalculation(grossIncomeInput) {
  eiRate * grossIncomeInput < eiMax
    ? (eiPremium = eiRate * grossIncomeInput)
    : (eiPremium = eiMax);

  return eiPremium;
}

function cppCalculation(grossIncomeInput) {
  cppRate * grossIncomeInput < cppMax
    ? (cppPremium = cppRate * grossIncomeInput)
    : (cppPremium = cppMax);

  return cppPremium;
}

function labelMaker(word) {
  if (language == "fr") {
    if (word == "EI") {
      label = "AE";
    }
    if (word == "CPP") {
      label = "RPC";
    }
    if (word == "Deductions") {
      label = "Retenues";
    }
    if (word == "Net Income") {
      label = "Salaire net";
    }
    if (word == "Provincial Tax") {
      label = "Impôts provinciaux";
    }
    if (word == "Provincial Tax Brackets") {
      label = "Tranches d'imposition provinciales";
    }
    if (word == "Federal Tax") {
      label = "Impôts fédéraux";
    }
    if (word == "My Income") {
      label = "Mon revenu";
    }
    if (word == "Income Breakdown") {
      label = "Répartition de mon salaire";
    }
    if (word == "New Brunswick") {
      label = "Nouveau-Brunswick";
    }
    if (word == "Federal") {
      label = "Fédéral";
    }
    if (word == "Bracket") {
      label = "Tranche";
    }
    if (word == "My Taxable Income") {
      label = "Mon salaire imposable";
    }
    if (word == "You're taxed") {
      label = "Vous payez";
    }
    if (word == "of") {
      label = "de";
    }
    if (word == "You must enter a gross income AND select a province.") {
      label =
        "Il faut saisir votre salaire brut ET selectionnez votre province.";
    }
  } else {
    label = word;
  }
  return label;
}

const colors = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(255, 159, 64, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(201, 203, 207, 0.8)",
];

tableRows = document.getElementsByName("tableRow");
for (let i = 0; i < tableRows.length; i++) {
  tableRows[i].setAttribute("style", `background-color:${colors[i]}`);
}
fedTableRows = document.getElementsByName("fedTableRow");
for (let i = 0; i < tableRows.length; i++) {
  fedTableRows[i].setAttribute("style", `background-color:${colors[i]}`);
}

function configuration(dataset, yAxisTitle, labelDisplay, legendDisplay) {
  let configuration = {
    plugins: [ChartDataLabels],
    type: "bar",
    data: dataset,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      scales: {
        x: {
          stacked: true,
          barPercentage: 0.2,
        },
        y: {
          title: {
            display: true,
            text: yAxisTitle,
          },
          // max: taxableIncome + 20000,
          ticks: {
            // Include a dollar sign in the ticks
            callback: function (value, index, ticks) {
              return formatter.format(value);
            },
          },
          stacked: true,
        },
      },
      layout: {
        padding: 10,
      },
      plugins: {
        legend: {
          display: legendDisplay,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let dollarAmount = context.dataset.data[context.dataIndex];
              let label =
                context.dataset.label + formatter.format(dollarAmount);
              return label;
            },
          },
        },
        datalabels: {
          display: labelDisplay,
          formatter: function (value, context) {
            let dollarAmount = context.dataset.data[context.dataIndex];
            if (dollarAmount != null) {
              return formatter.format(dollarAmount);
            }
          },
        },
        title: {
          display: false,
          padding: 20,
          text: labelMaker("Provincial Tax Brackets"),
        },
      },
    },
  };
  return configuration;
}

function addData(chart, label, color, data) {
  chart.data.datasets.push({
    label: label,
    backgroundColor: color,
    data: data,
    barThickness: 200,
  });
  chart.update();
}

function removeData(chart) {
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
    dataset.data.pop();
  });
  chart.update();
}

const submitButton = document.getElementById("button0");
document.addEventListener("keydown", function (enter) {
  if (enter.key === "Enter" && grossIncomeField.value != "") {
    submitButton.click();
  }
});

const grossIncomeField = document.getElementById("grossIncomeField");
Chart.defaults.font.size = 16;
Chart.defaults.plugins.legend.position = "bottom";
Chart.defaults.plugins.legend.labels.padding = 20;

function onSubmit() {
  if (!provinceSelected || !grossIncomeField.value) {
    alert(
      `${labelMaker("You must enter a gross income AND select a province.")}`
    );
    for (let i = 2; i < 6; i++) {
      let section = document.getElementById(`${i}`);
      section.classList.add("d-none");
    }
    return false;
  }
  if (document.getElementById("grossIncomeField").value != "") {
    alreadySubmitted = true;
    for (let i = 2; i < 6; i++) {
      let section = document.getElementById(`${i}`);
      section.classList.remove("d-none");
    }
    removeInnerText("taxableIncome");
    removeInnerText("ei");
    removeInnerText("cpp");
    removeInnerText("grossIncome2");
    removeInnerText("deductionsTotal");
    removeInnerText("provTaxTotal");
    removeInnerText("fedTaxTotal");
    removeInnerText("netIncome");
    currencyFormatter();

    grossIncome = numOnly(grossIncomeField.value);
    let taxableIncome =
      grossIncome -
      cppCalculation(grossIncome) -
      eiCalculation(grossIncome) -
      totalDeductions;

    if (taxableIncome < 0) {
      taxableIncome = 0;
    }

    nameInnerText("grossIncome2", formatter.format(grossIncome));
    nameInnerText("taxableIncome", formatter.format(taxableIncome));
    nameInnerText("cpp", `- ${formatter.format(cppCalculation(grossIncome))}`);
    nameInnerText("ei", `- ${formatter.format(eiCalculation(grossIncome))}`);
    nameInnerText("deductionsTotal", `- ${formatter.format(totalDeductions)}`);

    // PROVINCIAL SECTION
    actualProvBracket = isInBracket(provBracket, taxableIncome);
    provBracketRate = document.getElementsByName("provBracketRate");
    provBracketTotal = document.getElementsByName("provBracketTotal");

    // Provincial Data Table
    for (let i = 0; i < provBracketRate.length; i++) {
      if (language == "fr") {
        provBracketRate[i].innerHTML = `${formatAsPercent(
          provBracketPerc[i]
        )} de ${formatter.format(actualProvBracket[i])}`;

        if (actualProvBracket[i] == "0" || actualProvBracket[i] == null) {
          provBracketRate[i].innerHTML = "Pas dans cette tranche";
        }
      } else {
        provBracketRate[i].innerHTML = `${formatAsPercent(
          provBracketPerc[i]
        )} of ${formatter.format(actualProvBracket[i])}`;
        if (actualProvBracket[i] == "0" || actualProvBracket[i] == null) {
          provBracketRate[i].innerHTML = "Not in this bracket.";
        }
      }
      provBracketTotal[i].innerHTML = `${formatter.format(
        provBracketPerc[i] * actualProvBracket[i]
      )}`;
      if (actualProvBracket[i] == null) {
        provBracketTotal[i].innerHTML = `${formatter.format(0)}`;
      }
    }

    let provTaxTotal = 0;
    for (let i = 0; i < actualProvBracket.length; i++) {
      provTaxTotal += actualProvBracket[i] * provBracketPerc[i];
    }
    nameInnerText("provTaxTotal", formatter.format(provTaxTotal));

    // Provincial Graph
    const provData = {
      labels: [`Provincial: ${province} (${provDataYear})`],
      datasets: [],
    };

    const configProv = configuration(
      provData,
      labelMaker("My Taxable Income"),
      true,
      false
    );
    provData.datasets = [];

    provDataChart && provDataChart.destroy();

    provDataChart = new Chart(document.getElementById("myChart"), configProv);

    provDataChart.update();

    for (let i = 0; i < actualProvBracket.length; i++) {
      if (actualProvBracket[i] != 0) {
        addData(
          provDataChart,
          `${labelMaker("Bracket")} ${i + 1}: ${formatAsPercent(
            provBracketPerc[i]
          )} ${labelMaker("of")} `,
          colors[i],
          [actualProvBracket[i]]
        );
      }
    }

    // FEDERAL SECTION

    fedBracketRate = document.getElementsByName("fedBracketRate");
    fedBracketTotal = document.getElementsByName("fedBracketTotal");
    actualFedBracket = isInBracket(fedBracket, taxableIncome);

    // Fed Tax Table

    for (let i = 0; i < fedBracketRate.length; i++) {
      if (language == "fr") {
        fedBracketRate[i].innerHTML = `${formatAsPercent(
          fedBracketPerc[i]
        )} de ${formatter.format(actualFedBracket[i])}`;

        if (actualFedBracket[i] == "0" || actualFedBracket[i] == null) {
          fedBracketRate[i].innerHTML = "Pas dans cette tranche";
        }
      } else {
        fedBracketRate[i].innerHTML = `${formatAsPercent(
          fedBracketPerc[i]
        )} of ${formatter.format(actualFedBracket[i])}`;
        if (actualFedBracket[i] == "0" || actualFedBracket[i] == null) {
          fedBracketRate[i].innerHTML = "Not in this bracket.";
        }
      }
      fedBracketTotal[i].innerHTML = `${formatter.format(
        fedBracketPerc[i] * actualFedBracket[i]
      )}`;
      if (actualFedBracket[i] == null) {
        fedBracketTotal[i].innerHTML = `${formatter.format(0)}`;
      }
    }

    let fedTaxTotal = 0;
    for (let i = 0; i < actualFedBracket.length; i++) {
      fedTaxTotal += actualFedBracket[i] * fedBracketPerc[i];
    }
    nameInnerText("fedTaxTotal", formatter.format(fedTaxTotal));

    // Federal Graph

    const fedData = {
      labels: [`${labelMaker("Federal")}: Canada (${fedDataYear})`],
      datasets: [],
    };

    const configFed = configuration(
      fedData,
      labelMaker("My Taxable Income"),
      true,
      false
    );
    fedData.datasets = [];

    fedDataChart && fedDataChart.destroy();

    fedDataChart = new Chart(document.getElementById("fedChart"), configFed);

    fedDataChart.update();

    for (let i = 0; i < actualFedBracket.length; i++) {
      if (actualFedBracket[i] != 0) {
        addData(
          fedDataChart,
          `${labelMaker("Bracket")} ${i + 1}: ${formatAsPercent(
            fedBracketPerc[i]
          )} ${labelMaker("of")} `,
          colors[i],
          [actualFedBracket[i]]
        );
      }
    }

    let netIncome =
      grossIncome -
      cppCalculation(grossIncome) -
      eiCalculation(grossIncome) -
      provTaxTotal -
      fedTaxTotal;

    nameInnerText("netIncome", `${formatter.format(netIncome)}`);

    // Net Income Chart

    const netIncomeData = {
      labels: [`${labelMaker("Net Income")}`],
      datasets: [],
    };

    function findConfig() {
      if ($(window).width() > 960) {
        config3 = configuration(
          netIncomeData,
          labelMaker("My Income"),
          false,
          true
        );
      }
      if ($(window).width() < 960) {
        config3 = configuration(
          netIncomeData,
          labelMaker("My Income"),
          false,
          false
        );
      }
      return config3;
    }

    const configNetIncome = findConfig();

    netIncomeData.datasets = [];

    netIncomeChart && netIncomeChart.destroy();

    netIncomeChart = new Chart(
      document.getElementById("netIncomeChart"),
      configNetIncome
    );

    netIncomeChart.update();

    addData(netIncomeChart, `${labelMaker("Net Income")} `, colors[0], [
      netIncome,
    ]);
    addData(netIncomeChart, `${labelMaker("Provincial Tax")} `, colors[1], [
      provTaxTotal,
    ]);
    addData(netIncomeChart, `${labelMaker("Federal Tax")} `, colors[2], [
      fedTaxTotal,
    ]);
    addData(netIncomeChart, `${labelMaker("CPP")} `, colors[3], [cppPremium]);
    addData(netIncomeChart, `${labelMaker("EI")} `, colors[4], [eiPremium]);
    addData(netIncomeChart, `${labelMaker("Deductions")} `, colors[5], [
      totalDeductions,
    ]);
  }
}

submitButton.addEventListener("click", onSubmit);

// Tax Brackets indicate the ACTUAL tax bracket array of the user, along with their gross income input

function isInBracket(taxBrackets, income) {
  let bracketTotals = [];

  if (income < taxBrackets[0]) {
    bracketTotals[0] = income;
  } else {
    bracketTotals[0] = taxBrackets[0];
    for (let i = 1; i < taxBrackets.length; i++) {
      if (income > taxBrackets[i]) {
        bracketTotals[i] = taxBrackets[i] - taxBrackets[i - 1];
      } else if (income < taxBrackets[i] && income > taxBrackets[i - 1]) {
        bracketTotals[i] = income - taxBrackets[i - 1];
      } else {
        bracketTotals[i] = 0;
      }
    }
  }
  if (income > taxBrackets[taxBrackets.length - 1]) {
    bracketTotals.push(income - taxBrackets[taxBrackets.length - 1]);
  }

  return bracketTotals;
}

// Input fields for money

$("input[data-type='currency']").on({
  keyup: function () {
    formatCurrency($(this));
  },
  blur: function () {
    formatCurrency($(this), "blur");
  },
});

function formatNumber(n) {
  // format number 1000000 to 1,234,567
  return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(input, blur) {
  // appends $ to value, validates decimal side
  // and puts cursor back in right position.

  // get input value
  var input_val = input.val();

  // don't validate empty input
  if (input_val === "") {
    return;
  }

  // original length
  var original_len = input_val.length;

  // initial caret position
  var caret_pos = input.prop("selectionStart");

  // check for decimal
  if (input_val.indexOf(".") >= 0) {
    // get position of first decimal
    // this prevents multiple decimals from
    // being entered
    var decimal_pos = input_val.indexOf(".");

    // split number by decimal point
    var left_side = input_val.substring(0, decimal_pos);
    var right_side = input_val.substring(decimal_pos);

    // add commas to left side of number
    left_side = formatNumber(left_side);

    // validate right side
    right_side = formatNumber(right_side);

    // Limit decimal to only 2 digits
    right_side = right_side.substring(0, 2);

    // join number by .
    input_val = left_side + "." + right_side;
  } else {
    // no decimal entered
    // add commas to number
    // remove all non-digits
    input_val = formatNumber(input_val);
    input_val = input_val;
  }

  // send updated string to input
  input.val(input_val);

  // put caret back in the right position
  var updated_len = input_val.length;
  caret_pos = updated_len - original_len + caret_pos;
  input[0].setSelectionRange(caret_pos, caret_pos);
}

// POPOVERS

function createPopover(eName, titleContent, bodyContent) {
  const e = document.getElementsByName(eName);
  for (let i = 0; i < e.length; i++) {
    e[i].setAttribute("title", titleContent);
    e[i].setAttribute("data-content", bodyContent);
    new bootstrap.Popover(e[i], {
      title: titleContent,
      content: bodyContent,
      trigger: "hover",
    });
  }
}

function setPopoversFr() {
  currencyFormatter();
  if (language == "fr") {
    createPopover(
      "taxableIncomePopover",
      "Le salaire imposable",
      "Le montant utilisé pour calculer votre impôt fédéral et provincial."
    );
    createPopover(
      "grossIncomePopover",
      "Le salaire brut",
      "Votre salaire sans retenues"
    );
    createPopover(
      "provincialTaxPopover",
      "Les impôts provinciaux",
      "financent les soins de santé, l'éducation, les services sociaux, les routes, etc."
    );
    createPopover(
      "federalTaxPopover",
      "Les impôts fédéraux",
      "financent la défense nationale, les affaires étrangères, la poste, etc."
    );
    createPopover(
      "rrspPopover",
      "Régime enregistré d'épargne-retraite (REÉR)",
      "Un compte d'épargne retraite qui vous permet de réduire votre salaire imposable."
    );
    createPopover(
      "cppPopover",
      "Régime de pension du Canada",
      `Un programme d'épargne obligatoire qui permet d'épargner ${
        cppRate * 100
      }% de ton salaire brut, jusqu'à un maximum de ${formatter.format(
        cppMax
      )}. Votre employeur contribue le même montant aux côtisations, et cet argent sera à votre disposition pendant vos années de retraite.`
    );
    createPopover(
      "taxBracketPopover",
      "Les tranches d'imposition",
      "Votre salaire se divise en groupes ou tranches. Il faut payer des impôts plus élevés lorsqu'on monte les tranches d'imposition."
    );
    createPopover(
      "eiPopover",
      "Assurance-Emploi",
      `offre un soutien du revenu temporaire aux travailleurs sans emploi pendant qu'ils cherchent du travail ou perfectionnent leurs compétences. Il faut côtiser ${
        eiRate * 100
      }% de votre salaire brut, jusqu'à un maximum de ${formatter.format(
        eiMax
      )}. 
   `
    );

    createPopover(
      "netIncomePopover",
      "Salaire net",
      "Votre salaire après toutes les côtisations et retenues."
    );

    createPopover(
      "deductionsPopover",
      "Les retenues",
      "On peut réduire son salaire imposable en soustrant les retenues."
    );
  }
}

function setPopoversEn() {
  currencyFormatter();
  createPopover(
    "taxableIncomePopover",
    "Taxable Income",
    "The portion of your income that is taxed by the the provincial and federal government."
  );
  createPopover(
    "grossIncomePopover",
    "Gross Income",
    "Your salary without any deductions."
  );
  createPopover(
    "provincialTaxPopover",
    "Provincial Taxes",
    "Pay for healthcare, education, social services, roads, and more"
  );
  createPopover(
    "federalTaxPopover",
    "Federal Taxes",
    "Pay for national defence, foreign affairs, the post office, and more."
  );
  createPopover(
    "rrspPopover",
    "Registered Retirement Savings Plan (RRSP)",
    "A retirement savings account that allows you to reduce your taxable income."
  );
  createPopover(
    "taxBracketPopover",
    "Tax Brackets",
    "You are taxed differently on each portion of your income. The bracket and taxes can change yearly, and they are different for the provincial and federal government."
  );

  createPopover(
    "cppPopover",
    "Canada Pension Plan",
    `A mandatory savings program that sets aside ${
      cppRate * 100
    }% of your gross income, up to a maximum of ${formatter.format(
      cppMax
    )}. Your employer contributes the same amount, and this money will be available to you in your retirement years.`
  );

  createPopover(
    "eiPopover",
    "Employment Insurance",
    `A mandatory insurance program that provides you part of your salary if you lose your job (conditions apply). You must pay ${
      eiRate * 100
    }% of your gross income, up to a maximum of ${formatter.format(eiMax)}. 
  `
  );

  createPopover(
    "netIncomePopover",
    "Net Income",
    "Your 'take home' income, after all deductions and taxes."
  );

  createPopover(
    "deductionsPopover",
    "Deductions",
    "You can reduce your taxable income by subtracting deductions."
  );

  createPopover(
    `bracket5tooltip`,
    `Bracket 5`,
    `${(provBracketPerc[4] * 100).toFixed(
      1
    )}% on the portion of your taxable income that is more than ${formatter.format(
      provBracket[3]
    )}`
  );

  createPopover(
    `bracket5tooltipfed`,
    `Bracket 5`,
    `${(fedBracketPerc[4] * 100).toFixed(
      1
    )}% on the portion of your taxable income that is more than ${formatter.format(
      fedBracket[3]
    )}`
  );
}

function setPopovers() {
  $(document).ready(function () {
    // Showing and hiding tooltip with different speed
    $('[data-toggle="tooltip"]').tooltip({
      delay: { show: 50, hide: 200 },
      placement: "right",
      html: true,
    });
  });

  language == "fr" ? setPopoversFr() : setPopoversEn();
}

setPopovers();
