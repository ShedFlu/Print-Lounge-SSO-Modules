# SSO Interface Version 2

The SSO interface allows for automated login and registration of users. Typically, the interface is used to process data from a customer system (e.g., via a CMS or CRM system, intranet, or procurement platform). BRAND PRINT is called via a link with a specially encrypted query string.

The URL is as follows:

<https://shopname.print-server.net/sso.php?h=ENCODED_KEY_VALUE_PAIRS>

`ENCODED_KEY_VALUE_PAIRS` must be replaced with the encrypted data. If the data is processed successfully, the user is logged into the system and can use the portal as usual.
**The transmitted data must be encrypted using the preset encryption method (aes-128-cbc, aes-192-cbc, aes-256-cbc).**

The following data can be transmitted:

| Label | Type / Value | Remark | Version |
| - | - | - | - |
| request_time \* | Date and time (ISO 8601) | Time of the call (Standard validity of the request 500s - 8 min) | since 4.3.23 |
| customer_user_name \* | 50 characters (A-Z0-9\_-.@) | Use unique identifiers such as UserIds, Emails, or usernames | |
| customer_user_budgetgruppe__id | Integer | If no user group is passed, the user will be created in a defined default user group.<br />The same applies if the system cannot determine a valid user group based on the ID. | |
| group_customer_number | | If the name of the user group is passed, it is checked whether the customer number with exactly this value exists in the group.<br />If not, the user is assigned to the default group. If there is a match, the user is assigned to the respective group.<br />ATTENTION: Only works if the option "Determine user groups based on customer number" has been activated. | |
| group_name | 50 characters (Utf8) | If the name of the user group is passed, it is checked whether the group exists with exactly this name.<br />If not, the group is newly created. The user is assigned to this group.<br />ATTENTION: Only works if the option "Automatically create user groups" has been activated. | since 6.34.0 |
| customer_longname | 50 characters (Utf8) | | |
| customer_firstname | 50 characters (Utf8) | | |
| customer_lastname | 50 characters (Utf8) | | |
| customer_user_businessunit | 50 characters (Utf8) | | |
| customer_user_purchaser | 50 characters (Utf8) | | |
| customer_user_company1 | 200 characters (Utf8) | | |
| customer_user_company2 | 200 characters (Utf8) | | |
| customer_user_company3 | 200 characters (Utf8) | | |
| customer_user_street | 200 characters (Utf8) | | |
| customer_user_zip | 10 characters (Utf8) | | |
| customer_user_town | 200 characters (Utf8) | | |
| customer_user_country | 200 characters (Utf8) | Deprecated, use customer_user_countrycode | |
| customer_user_countrycode | Country code (ISO 3166) | | since 4.2.10 |
| customer_user_costcenter | 200 characters (Utf8) | | |
| customer_user_telefon | 200 characters (Utf8) | | |
| customer_user_telefax | 200 characters (Utf8) | | |
| customer_user_email | 100 characters (Utf8) | | |
| user_groups_binary_url | 200 characters (Utf8) | URL for logo (image) of a user group | |
| user_groups_binary_description | 50 characters (Utf8) | Description for logo (image) of a user group | |
| customer_user_internet | 100 characters (Utf8) | | |
| customer_user_mobil | 50 characters (Utf8) | | |
| customer_user_kundennummer | 100 characters (Utf8) | | |
| customer_user_level | Integer | | |
| freigabeportal_zeigen | 53: Yes, 54: No (Default) | | |
| customer_user_aussendienst | 200 characters (Utf8) | | |
| customer_funktion | 200 characters (Utf8) | | |
| sprache | de: German (Default), en: English (deprecated) | | |
| customfield1 | 200 characters (Utf8) | | |
| customfield2 | 200 characters (Utf8) | | |
| customfield3 | 200 characters (Utf8) | | |
| customfield4 | 200 characters (Utf8) | | |
| customfield5 | 200 characters (Utf8) | | |
| customer_user_level | 57: A - User (Default), 58: B - Supervisor, 59: C - Administration, 60: X - Interested parties | | |
| delivery_address_editable | 0: Yes, 1: No, without Email, 2: No | Determines whether the delivery address is editable in the shopping cart. | |
| dest_page | wg: A product group page, pers: A personalization page, article_detail: Detail page for article, reorder: Reorder | | |
| dest_id | The ID of the entry (product group or article) | | |
| quantity | The quantity from the price scale (If no quantity is transmitted, the system determines the smallest price scale for the respective article) | | |
| skip_cart | 53: Yes, 54: No (Default) | | |
| continue_shopping | Shows the "Continue shopping" button in the shopping cart. 0: Deactivate, 1: Activate, 2: to SSO transfer point. Attention: When activating, the variable "skip_cart" is ignored. | | |
| pers_data | Used for the transmission of personalization data (see below) | | |
| test | To activate the test mode, the parameter "test = true" can be passed. Instead of redirecting, a screen output of the passed data takes place. | | |
| lang | Language ID: Found under: Shops → Edit → Language Settings. de_DE or en_EN, if the option "Multilingual ordering portal" under Administration → Settings → General is not activated. | | |
| dynamic_lists | Pass list entries via the SSO interface as a JSON string. (You can learn more about this under the item "Dynamic list entries") | | |
| view_settings | Type/Value: Array<br /><br />cookie_notice = 1: Show 0: Hide<br />color_bar = 1: Show 0: Hide<br />top_header = 1: Show 0: Hide<br />header = 1: Show 0: Hide<br />nav = 1: Show 0: Hide<br />footer = 1: Show 0: Hide<br />iframe_autoheight = 1: activate 0: deactivate<br /><br />Note: OCI must be activated and the setting "Use in IFrame?" must be deactivated. Only compatible with the premium template. | | |
| email_address_for_cost_release | Email address for cost release (from version 6.0.0) | | |
| external_order_number | External order number | Via this parameter, an order number from an external system can be passed, which is then stored as an "External order number" in the new order when a purchase is triggered within BRAND PRINT. | |
| return_url | 200 characters | If a URL is specified here, a button is displayed on the Finish page that leads to this URL | |
| settings | Array | This array can contain all user settings as key-value pairs that should be set. | |
| redirect_url | 200 characters (Utf8) | A URL (e.g., "/makepage.php?searchStr=test&p=search") can be entered here. If a successful login takes place, the user is directed directly to the specified URL. | |

\* Mandatory fields

After logging into the system, all functions are available as usual, as if the user had logged in regularly. Optionally, regular login with username and password can be deactivated, so that users can only access the system via the interface.

## Cancel Order

The following data must be transmitted:

| key | Type | Remark | Version |
| - | - | - | - |
| request_time * | Date and time (ISO 8601) | Time of the call (Standard validity of the request 500s - 8 min) | since 4.3.23 |
| dest_page | cancel_order | | |
| dest_id | The order code | | |

## Dynamic Selection List Entries

With this function, the list entries can be passed via the SSO interface in JSON format.

*Note: The extension exclusively supports one-dimensional lists; further fields are not affected by the list function.*

**JSON string example:**

```json
{
  "FELD_ANREDE": {
    "default_value": "w",
    "options": [
      {
        "name": "Ms.",
        "value": "w"
      },
      {
        "name": "Mr.",
        "value": "h"
      }
    ]
  },
  "FELD_TELEFON_LAENDERVORWAHL": {
    "default_value": "0049",
    "options": [
      {
        "name": "(+49 Germany)",
        "value": "0049"
      },
      {
        "name": "(+43 Austria)",
        "value": "0043"
      }
    ]
  }
}
```

## Log in user without username with a temporary username

If the option '**Log in user without username with temporary username**' is activated, the option '**Register unknown users**' is activated, and no ENCODED_KEY_VALUE_PAIRS (?h=) are passed, a temporary user with a dummy username is created.

## User Settings

This array can contain all user settings as key-value pairs that should be set.

**UserBudgetSettings** expand source

| Key | Type |
| - | - |
| activateUserDiscount | Boolean |
| activateUserDiscountDescription | String |
| activateUserDiscountValue | Boolean |
| blockPurchaseOrderOnUsedBudget | Boolean |
| blockPurchaseOrderOnUsedBudgetMessage | String |
| budgetValue | Float |
| clientId | Integer |
| customerUserHandling | Boolean |
| customerUserId | Integer |
| customerUserSubtractDeliveryCosts | Boolean |
| minimumOrderValue | Float |
| shopUserGroupId | Integer |

The UserBudgetSettings are passed as a json_encoded string in the SSO data array under the key "UserBudgetSettings".
