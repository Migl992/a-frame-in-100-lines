import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit';
import { NextRequest, NextResponse } from 'next/server';
import { NEXT_PUBLIC_URL } from '../../config';

const errorImage = (text: string) => {
  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Node ID: ${text}`,
        },
      ],
      image: {
        src: `https://dummyimage.com/600x400/191a23/fff.png&text=Error`,
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  );
}

async function getResponse(req: NextRequest): Promise<NextResponse> {
  let accountAddress: string | undefined = '';
  let text: string | undefined = '';

  const body: FrameRequest = await req.json();
  const { isValid, message } = await getFrameMessage(body, { neynarApiKey: 'NEYNAR_ONCHAIN_KIT' });

  if (isValid) {
    accountAddress = message.interactor.verified_accounts[0];
  }

  if (message?.input) {
    text = message.input;
  }

  const url = `https://avascan.info/api/pvm/validator/${text}?ecosystem=avalanche`;
    
  // Effettua una richiesta GET
  const response = await fetch(url);

  if (!response.ok) {
    return errorImage(text);
  }

  const data = await response.json();

  let score = data?.validationsSuccessRate?.percentage;
  score = score * 100;

  return score ?  new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Node ID: ${text}`,
        },
      ],
      image: {
        src: `https://dummyimage.com/600x400/191a23/fff.png&text=Validation+Success+Rate:+${score}%25`,
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  ) : errorImage(text);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
