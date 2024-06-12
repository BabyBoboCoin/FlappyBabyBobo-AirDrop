import { NextResponse } from 'next/server';
import pool from '../../../../lib/db';

export async function POST(req) {
  console.log('Highscore request received');
  try {
    const { walletAddress, score } = await req.json();
    console.log('Request body:', { walletAddress, score });

    if (!walletAddress || score == null) {
      console.log('Invalid request data');
      return NextResponse.json({ success: false, message: 'Wallet address and score are required' }, { status: 400 });
    }

    const client = await pool.connect();
    console.log('Connected to database');

    try {
      const insertQuery = 'INSERT INTO highscores (wallet_address, score) VALUES ($1, $2)';
      await client.query(insertQuery, [walletAddress, score]);
      console.log('Highscore entry inserted');

      return NextResponse.json({ success: true, message: 'Highscore successfully recorded' }, { status: 200 });
    } catch (error) {
      console.error('Error processing highscore:', error);
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

export async function GET() {
  console.log('Fetching highscores');
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM highscores ORDER BY score DESC');
    console.log('Highscores fetched:', result.rows);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching highscores:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  } finally {
    client.release();
    console.log('Database connection released');
  }
}
