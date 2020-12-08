import * as compress from 'compression';
import * as helmet from 'helmet';
import * as hpp from 'hpp';
import * as cookieParser from 'cookie-parser';

// import * as RateLimit from 'express-rate-limit'

import * as Sentry from '@sentry/node';
import * as express from 'express';
import { Express } from 'express';
import { Server } from 'http';
import { routes } from './routes/index';
import { ContentRoute } from './routes/content';
import { AppEvents } from './events';
import { ExpressEventsManager } from './events/express';
// import { WorkFlowRuleValidation } from './utils/workflow-util/workflow-rule-validation';

export class ExpressServer {
	private server?: Express;
	public httpServer?: Server;

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	constructor() {
		if (process.env.SentryDSN) Sentry.init({ dsn: process.env.SentryDSN });
	}

	public async start(port: number): Promise<Express> {
		const server = express();
		this.setupStandardwithSecurityMiddleWares(server);
		// this.setupApplicationMiddlewares(server);
		await this.setupApplicationRoutes(server);
		this.httpServer = server.listen(port);
		this.server = server;

		// Adding Server reference to AppEvents
		AppEvents.routerEvents = new ExpressEventsManager(this.server);

		return this.server;
	}

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	public kill() {
		if (this.httpServer) this.httpServer.close();
	}

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	private setupStandardwithSecurityMiddleWares(server: Express) {
		server.use(express.json());
		server.use(cookieParser());
		server.use(compress());
		server.use(hpp());
		server.use(helmet());
		server.use(helmet.referrerPolicy({ policy: 'same-origin' }));
		server.use(helmet.noCache());
		server.use(helmet.contentSecurityPolicy({
			directives: {
				defaultSrc: [`'self'`],
				styleSrc: [`'unsafe-inline'`],
				scriptSrc: [`'unsafe-inline'`, `'self'`]
			}
		}));
		// server.use(this.errorHandler);

		if (process.env.SentryDSN) {
			server.use(Sentry.Handlers.requestHandler() as express.RequestHandler);
			server.use(Sentry.Handlers.errorHandler() as express.ErrorRequestHandler);
		}
	}

	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	// private setupApplicationMiddlewares(server: Express) {
	//     return true;
	// }

	// eslint-disable-next-line
	private async setupApplicationRoutes(server: Express): Promise<void> {

		try {
			routes.forEach(route => {
				server.use('/api', route.router);
			});

			server.use('/status', (_req: express.Request, res: express.Response) => {
				res.send('All OK');
			});

			const dynamicEntitiesRoutes = await new ContentRoute().fetchApplicationEntities();
			server.use('/api/content', dynamicEntitiesRoutes);

			/* setTimeout(async () => {
				console.log('Route added');
				const rule = [{
					'operator': 'equals',
					'field': 'amount',
					'value': 100,
					'children': [{
						'multiple': true,
						'operator': 'or',
						'message': 'Error here...',
						'conditions': [{
							'operator': 'equals',
							'field': 'amount',
							'value': 102
						}, {
							'operator': 'not equals',
							'field': 'department',
							'value': 'Test Dept'
						}]
					}]
				}];
				const doc = {
					amount: 100,
					department: 'Test Dept.'
				};
				try {
					const x = new WorkFlowRuleValidation(rule as any, doc);
					const script = x.parseRules(rule as any);
					console.log(script);
					const result = await x.execScript(script);
					console.log(result);
				} catch (error) {
					console.log(error);
				}

			}, 5000); */

		} catch (error) {
			this.httpServer.close(error);
		}

	}

	// eslint-disable-next-line
	/* private errorHandler(err: Error, _req: express.Request, res: express.Response): void {
		console.error(err.stack);
		res.status(500).json({
			success: false,
			message: 'Server Error. Contact Support...'
		})
	} */

}
