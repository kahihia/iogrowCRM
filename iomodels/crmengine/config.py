E_LEAD = 'e_lead'
E_CONTACT = 'e_contact'
E_ACCOUNT = 'e_account'
E_CASE = 'e_case'
E_EVENT = 'e_event'
E_TASK = 'e_task'
E_OPPORTUNITY = 'e_opportunity'

FREEMIUM = 'freemium'
PREMIUM = 'premium'
LIFE_FREE = 'life_free'

MONTHLY = 'monthly'
YEARLY = 'yearly'

PREMIUM_YEARLY_PRICE = 15000
PREMIUM_MONTHLY_PRICE = 1500

STRIPE_API_KEY = "sk_test_9WaLpLhVb0W9tKInz6Bs6x6l"

# Choices
PLANS_INTERVALS = (MONTHLY, YEARLY)
PLANS_NAMES = (FREEMIUM, PREMIUM, LIFE_FREE)
PRICES = (PREMIUM_YEARLY_PRICE, PREMIUM_MONTHLY_PRICE)
ALL_KINDS = (E_LEAD, E_TASK, E_ACCOUNT, E_EVENT, E_OPPORTUNITY, E_CASE)
KINDS = (E_LEAD, E_TASK, E_ACCOUNT, E_EVENT, E_OPPORTUNITY, E_CASE, ALL_KINDS)

ALL_KINDS_LIMIT = 10000
