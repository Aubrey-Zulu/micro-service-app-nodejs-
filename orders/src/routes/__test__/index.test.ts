import { Types } from 'mongoose';
import request from 'supertest';
import { app } from '../../app';

import { Ticket, TicketAttrs } from '../../models/ticket';
import { signin } from '../../test/setup';

const buildTicket = async () => {
  const ticket = new Ticket<TicketAttrs>({
    _id: new Types.ObjectId().toHexString(),
    title: 'concert',
    price: 20,
    userId: new Types.ObjectId().toHexString(),
  });
  await ticket.save();

  return ticket;
};

it('fetches orders for an particular user', async () => {
  // Create three tickets
  const ticketOne = await buildTicket();
  const ticketTwo = await buildTicket();
  const ticketThree = await buildTicket();

  const userOne = signin();
  const userTwo = signin();
  // Create one order as User #1
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  // Create two orders as User #2
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);
  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  // Make request to get orders for User #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only got the orders for User #2
  expect(response.body.orders.length).toEqual(2);
  expect(response.body.orders[0].id).toEqual(orderOne.order.id);
  expect(response.body.orders[1].id).toEqual(orderTwo.order.id);
  expect(response.body.orders[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body.orders[1].ticket.id).toEqual(ticketThree.id);
});
