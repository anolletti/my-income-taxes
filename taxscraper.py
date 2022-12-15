from selenium import webdriver
from selenium.common import StaleElementReferenceException, NoSuchWindowException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
import re
import json

CRA_URL = "https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions" \
          "-individuals/canadian-income-tax-rates-individuals-current-previous-years.html "

tax_dictionary = {
    "provinces": [],
    "codes": [],
    "tax_brackets": [],
    "tax_rates": []
}

nested_dictionary = {}


# Selenium interacts with web browsers
# the chrome driver is the bridge that allows Selenium to interact with Chrome

class MakeBot:
    def __init__(self, url):
        self.chrome_driver_path = "/Users/anthonynolletti/Documents/Development/chromedriver"
        self.driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
        self.driver.get(url)


cra_bot = MakeBot(CRA_URL)
time.sleep(1)


def prov_code(prov_name, code):
    if tax_dictionary["provinces"][i] == prov_name:
        tax_dictionary["codes"].append(code)
    else:
        return False


while True:
    try:
        # Collects text from cra site
        tables = cra_bot.driver.find_elements(By.XPATH, "/html/body/main/div[17]/table/tbody")

        tds = cra_bot.driver.find_elements(By.TAG_NAME, "td")

        # Collects names of provinces
        for province in range(0, len(tds), 2):
            tax_dictionary["provinces"].append(tds[province].text.strip())

        # Collects tax rates and brackets
        for rate in range(1, len(tds), 2):
            tax_dictionary["tax_rates"].append(re.findall(r'\b(?<!\.)(?!0+(?:\.0+)?%)(?:\d|[1-9]\d|100)(?:('
                                                          r'?<!100)\.\d+)?%', tds[rate].text))
            tax_dictionary["tax_brackets"].append(
                list(dict.fromkeys(re.findall(r'(\$[0-9]+\,[0-9]+)', tds[rate].text))))

    except StaleElementReferenceException:
        cra_bot.driver.close()
        break

    except NoSuchWindowException:
        cra_bot.driver.close()
        break

    finally:
        # Formatting scraped values

        for i in range(len(tax_dictionary["provinces"])):
            # Adding provincial codes
            prov_code("British Columbia", "BC")
            prov_code("Alberta", "AB")
            prov_code("Saskatchewan", "SK")
            prov_code("Manitoba", "MB")
            prov_code("Ontario", "ON")
            prov_code("Quebec", "QC")
            prov_code("New Brunswick", "NB")
            prov_code("Prince Edward Island", "PEI")
            prov_code("Newfoundland and Labrador", "NL")
            prov_code("Nova Scotia", "NS")
            prov_code("Yukon", "YT")
            prov_code("Northwest Territories", "NT")
            prov_code("Nunavut", "NU")

        for bracket in tax_dictionary["tax_brackets"]:
            # Formatting string tax brackets to int without ',' and '$'
            for i in range(len(bracket)):
                edited_value = bracket[i].strip('$').replace(',', '')
                # Ensure values over 1,000,000 are accounted for due to regex limitations
                if int(edited_value) < 9999:
                    bracket[i] = int(edited_value) * 1000
                else:
                    bracket[i] = int(edited_value)

        # Remove % and transform from percentage to decimal value
        for rate in tax_dictionary["tax_rates"]:
            for i in range(len(rate)):
                edited_rate = round((float(rate[i].strip('%')) / 100), 4)
                rate[i] = edited_rate

        print(tax_dictionary)

        for i in range(len(tax_dictionary["provinces"])):
            nested_dictionary[tax_dictionary["codes"][i]] = {"name": tax_dictionary["provinces"][i], "brackets": tax_dictionary["tax_brackets"][i], "rates": tax_dictionary["tax_rates"][i]}

        with open("2022_data.json", "w") as write_file:
            json.dump(nested_dictionary, write_file, indent=4)

        break
