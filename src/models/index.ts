import * as mongoose from 'mongoose';

export class DBConnection {

	/** Initialize Mongo Connection */
	public static async initConnection(): Promise<void> {

		const dbConnection: string = process.env.mongoDB;
		try {
			await mongoose.connect(dbConnection, {
				useNewUrlParser: true,
				useUnifiedTopology: true,
				autoIndex: true,
				useCreateIndex: true,
				useFindAndModify: false
			});
			console.info('DB successfully connected');
		} catch (error) {
			console.error('Error connecting to db ', error);
			process.exit(1);
		}

		// Auto Connect on Disconnection
		mongoose.connection.on('disconnected', this.initConnection);

	}

}
