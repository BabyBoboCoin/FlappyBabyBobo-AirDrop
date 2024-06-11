import pool from '../../../../lib/db';
import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('Request received');
  try {
    const { walletAddress } = await req.json();
    console.log('Request body:', walletAddress);

    if (!walletAddress) {
      console.log('No wallet address provided');
      return NextResponse.json({ success: false, message: 'Wallet address is required' }, { status: 400 });
    }

    const client = await pool.connect();
    console.log('Connected to database');

    try {
      const checkQuery = 'SELECT * FROM airdrop WHERE wallet_address = $1';
      const checkResult = await client.query(checkQuery, [walletAddress]);
      console.log('Check result:', checkResult.rows);

      if (checkResult.rows.length > 0) {
        console.log('Airdrop already claimed');
        return NextResponse.json({ success: false, message: 'Airdrop already claimed' }, { status: 400 });
      }

      const insertQuery = 'INSERT INTO airdrop (wallet_address) VALUES ($1)';
      await client.query(insertQuery, [walletAddress]);
      console.log('Airdrop entry inserted');

      return NextResponse.json({ success: true, message: 'Airdrop successfully claimed' }, { status: 200 });
    } catch (error) {
      console.error('Error processing airdrop:', error);
      return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
    } finally {
      client.release();
      console.log('Database connection released');
    }
  } catch (error) {
    console.error('Error parsing request body:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
