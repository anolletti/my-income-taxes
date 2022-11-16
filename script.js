$('[lang="fr"]').hide();

let grossIncome, label, language;
let totalDeductions = 0;
let alreadySubmitted = false;

language = "en";

const languageButton = document.getElementById("languageButton");
languageButton.addEventListener("click", function () {
  $('[lang="fr"]').toggle();
  $('[lang="en"]').toggle();

  if (language == "en") {
    language = "fr";
    setPopovers();
    document
      .getElementById("grossIncomeField")
      .setAttribute("placeholder", "Salaire brut");
  } else if (language == "fr") {
    language = "en";
    setPopovers();
    document
      .getElementById("grossIncomeField")
      .setAttribute("placeholder", "Gross Income");
  }
  if (grossIncomeField != null) {
    onSubmit();
  }
});

document
  .getElementById("section1reveal")
  .addEventListener("click", function () {
    document.getElementById("1").classList.remove("d-none");
  });

// PROVINCIAL TAX DATA
let provDataYear = 2022;
let provBracket = [43835, 87671, 142534, 162383];
let actualProvBracket = [];
let provBracketPerc = [0.094, 0.1482, 0.165, 0.1784, 0.203];

// 2022 FEDERAL TAX DATA
let fedDataYear = 2022;

let fedBracket = [49020, 98040, 141978, 216611];
let actualFedBracket = [];
let fedBracketPerc = [0.15, 0.205, 0.26, 0.29, 0.33];
let eiRate = 0.0158;
let eiMax = 952.74;
let cppRate = 0.057;
let cppMax = 3499.8;

// Create our number formatter.

const currencyFr = "fr-CA";
const currencyEn = "en-CA";

function currencyFormatter() {
  let currency;
  if (language == "fr") {
    currency = currencyFr;
  } else {
    currency = currencyEn;
  }
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
  if (eiRate * grossIncomeInput < eiMax) {
    eiPremium = eiRate * grossIncomeInput;
  } else {
    eiPremium = eiMax;
  }
  return eiPremium;
}

function cppCalculation(grossIncomeInput) {
  if (cppRate * grossIncomeInput < cppMax) {
    cppPremium = cppRate * grossIncomeInput;
  } else {
    cppPremium = cppMax;
  }
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
  } else {
    label = word;
  }
  return label;
}

const colors = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(255, 159, 64, 0.8)",
  "rgba(255, 205, 86, 0.8)",
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

let provDataChart = null;
let fedDataChart = null;
let netIncomeChart = null;

function onSubmit() {
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
      labels: [`Provincial: ${labelMaker("New Brunswick")} (${provDataYear})`],
      datasets: [],
    };

    const configProv = configuration(
      provData,
      labelMaker("My Taxable Income"),
      true,
      false
    );
    provData.datasets = [];

    if (provDataChart != null) {
      provDataChart.destroy();
    }
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

    if (fedDataChart != null) {
      fedDataChart.destroy();
    }
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

    if (netIncomeChart != null) {
      netIncomeChart.destroy();
    }
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
      } else if (income < provBracket[i] && income > provBracket[i - 1]) {
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

  // POPOVERS FOR PROVINCIAL BRACKETS

  for (let i = 0; i < provBracketPerc.length; i++) {
    if (i == 0) {
      createPopover(
        "bracket1tooltip",
        `Bracket ${i + 1}`,
        `${(provBracketPerc[i] * 100).toFixed(
          1
        )}% on the portion of your taxable income that is ${formatter.format(
          provBracket[i]
        )} or less`
      );
    } else {
      createPopover(
        `bracket${i + 1}tooltip`,
        `Bracket ${i + 1}`,
        `${(provBracketPerc[i] * 100).toFixed(
          1
        )}% on the portion of your taxable income that is more than ${formatter.format(
          provBracket[i - 1]
        )} but not more than ${formatter.format(provBracket[i])} `
      );
    }
  }

  createPopover(
    `bracket5tooltip`,
    `Bracket 5`,
    `${(provBracketPerc[4] * 100).toFixed(
      1
    )}% on the portion of your taxable income that is more than ${formatter.format(
      provBracket[3]
    )}`
  );

  // TOOLTIP CONTENT FOR FEDERAL TAX BRACKETS
  for (let i = 0; i < fedBracketPerc.length; i++) {
    if (i == 0) {
      createPopover(
        "bracket1tooltipfed",
        `Bracket ${i + 1}`,
        `${(fedBracketPerc[i] * 100).toFixed(
          1
        )}% on the portion of your taxable income that is ${formatter.format(
          fedBracket[i]
        )} or less`
      );
    } else {
      createPopover(
        `bracket${i + 1}tooltipfed`,
        `Bracket ${i + 1}`,
        `${(fedBracketPerc[i] * 100).toFixed(
          1
        )}% on the portion of your taxable income that is more than ${formatter.format(
          fedBracket[i - 1]
        )} but not more than ${formatter.format(fedBracket[i])} `
      );
    }
  }

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

  if (language == "fr") {
    setPopoversFr();
  } else {
    setPopoversEn();
  }
}

setPopovers();
