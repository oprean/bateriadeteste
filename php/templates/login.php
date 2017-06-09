<div class="container">
    <div class="row">
        <div class="col-md-4"></div>
        <div class="col-md-4">
                <img class="img-responsive center-block" src="assets/img/logo_beta.svg">
            <form class="form-horizontal" method="post">
                <div class="form-group <?php echo isset($error)?'has-error':''?>">
                    <div class="col-sm-12">
                        <input type="text" class="form-control" id="username" name="username" placeholder="Username">
                    </div>
                </div>
                <div class="form-group <?php echo isset($error)?'has-error':''?>">
                    <div class="col-sm-12">
                        <input type="password" class="form-control" id="password" name="password" placeholder="Password">
                    </div>
                </div>
                <p class="error-block text-danger <?php echo !isset($error)?'hidden':''?>">
                    Error!
                </p>
                <div class="form-group">
                    <div class="col-sm-10">
                        <button type="submit" class="btn btn-primary btn-login">
                            Login
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <div class="col-md-4"></div>
    </div>
</div>