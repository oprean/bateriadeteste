<nav class="navbar navbar-default navbar-fixed-top">
  <div class="container-fluid">
    <!-- Brand and toggle get grouped for better mobile display -->
    <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href=".">Bateria de teste</a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav">
<?php if (!empty($user)) {?>
		<li><a href="#quiz/gifts/home">Home</a></li>	
<?php } else {?>     	      	

<?php } ?>
      </ul>
      <ul class="nav navbar-nav navbar-right">
<?php if (empty($user)) {?>
      	<li><a href="login">Login</a></li>	
<?php } else {?>
		<li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">Hi, <?php echo $user['name'] ?> <span class="caret"></span></a>
          <ul class="dropdown-menu" role="menu">
            <li><a href="#account">My Account</a></li>
<?php if ($user['name'] == 'admin') {?>
            <li><a href="#admin">Admin</a></li>	
<?php } ?>
            <li role="separator" class="divider"></li>
  			<li><a href="logout">Logout</a></li>
          </ul>
        </li>

<?php } ?>
      </ul>
		<form class="navbar-form navbar-right" role="search">
		  <div class="form-group">
		    <input type="text" class="form-control" placeholder="Search">
		  </div>
		  <button type="submit" class="btn btn-default">Submit</button>
		</form>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>