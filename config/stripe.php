<?php
// config/stripe.php
define('STRIPE_API_KEY', getenv('STRIPE_API_KEY') ?: 'pk_test_...');
define('STRIPE_SECRET_KEY', getenv('STRIPE_SECRET_KEY') ?: 'sk_test_...');
define('STRIPE_WEBHOOK_SECRET', getenv('STRIPE_WEBHOOK_SECRET') ?: 'whsec_...');
