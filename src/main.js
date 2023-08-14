
import ExtWSDriver from '@extws/server/driver'; // eslint-disable-line import/no-unresolved, import/extensions
import IP          from '@kirick/ip';

import ExtWSBunClient from './client.js';

export default class ExtWSBunDriver extends ExtWSDriver {
	#bun_server;

	constructor({
		path = '/ws',
		port,
		// payload_max_length,
	}) {
		super();

		this.#bun_server = Bun.serve(
			{
				port,
				perMessageDeflate: true,
				fetch(request, server) {
					const url = new URL(request.url);
					url.protocol = 'ws:';
					url.host = request.headers.get('host');
					url.port = port;

					if (url.pathname.startsWith(path)) {
						server.upgrade(
							request,
							{
								data: {
									url,
									headers: request.headers,
								},
							},
						);

						return;
					}

					return new Response(
						'Upgrade failed',
						{ status: 500 },
					);
				},
				websocket: {
					open: (bun_client) => {
						const client = new ExtWSBunClient(
							bun_client,
							this,
							{
								url: bun_client.data.url,
								headers: bun_client.data.headers,
								ip: new IP(bun_client.remoteAddress),
							},
						);

						bun_client._extws_client_id = client.id;

						this.onConnect(client);
					},
					message: (bun_client, payload) => {
						const client = this.clients.get(
							bun_client._extws_client_id,
						);

						if (client) {
							this.onMessage(
								client,
								payload,
							);
						}
					},
					close: (bun_client) => {
						const client = this.clients.get(
							bun_client._extws_client_id,
						);

						if (client) {
							client.disconnect(
								true, // is_already_disconnected
							);
						}
					},
				},
			},
		);
	}

	publish(channel, payload) {
		this.#bun_server.publish(
			channel,
			payload,
		);
	}
}
