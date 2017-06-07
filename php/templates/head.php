<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="Bateria de teste">
    <meta name="author" content="Sergiu Oprean">

	<title><?php echo DEBUG_MODE?'DEBUG ':''?>Bateria de teste</title>
	<link rel="stylesheet" type="text/css" href="https://fonts.googleapis.com/css?family=Tangerine|Roboto|Lato">
	<link rel="stylesheet" type="text/css" href="assets/css/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/animate.css">
	<link rel="stylesheet" type="text/css" href="assets/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="assets/css/jquery-ui.custom.css">
	<link rel="stylesheet" type="text/css" href="assets/css/backbone.modal.css">
	<link rel="stylesheet" type="text/css" href="assets/css/backbone.modal.theme.css">
	<link rel="stylesheet" type="text/css" href="assets/css/backgrid.min.css">
        <link rel="stylesheet" type="text/css" href="assets/css/backgrid-select-all.min.css">
        
    <link rel="stylesheet" type="text/css" href="assets/css/backgrid-filter.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/select2.min.css">
    
    <link rel="stylesheet" type="text/css" href="assets/css/alertify.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/alertify.bootstrap.theme.min.css">
	
	<link rel="stylesheet" type="text/css" href="assets/css/dashboard.css">
	<link rel="stylesheet" type="text/css" href="assets/css/main.css">
	<?php if (isset($jsapp) && $jsapp == true) { ?>
	<script type="text/javascript" data-main="<?php echo DEBUG_MODE?'js':'dist'?>/main" src="js/lib/require.min.js"></script>
	<script>
		define('globals', [], function() { 
			return <?php echo globaljs(); ?> 
		});
		require.config({
	     config : { 
	      i18n: {
	        locale: '<?=lang()?>' 
	      }
	     }
	   });
	</script>		 
	<?php } ?>
</head>