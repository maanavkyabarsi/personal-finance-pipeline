{{ config(alias='spending_by_category') }}

SELECT
    account_id,
    pfc_primary AS primary_category,
    pfc_detailed AS detailed_category,
    DATE_TRUNC(transaction_date, month) AS month,
    SUM(amount) AS total_spending
FROM {{ ref('silver_transactions') }}
WHERE
    pfc_detailed != 'LOAN_PAYMENTS_CREDIT_CARD_PAYMENT'
GROUP BY
    account_id,
    primary_category,
    detailed_category,
    month