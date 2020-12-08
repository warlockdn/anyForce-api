import * as path from 'path';
import { Application } from './app';
import { DBConnection } from './models';

// Loading .env
require('dotenv').config({ path: path.join(process.cwd() , '.env') });

// Connect DB
DBConnection.initConnection().then(() => {

	// Create Application Server
	Application.createApplication().then(() => {
		console.info('The application was started at port ', process.env.PORT);
	});

});
