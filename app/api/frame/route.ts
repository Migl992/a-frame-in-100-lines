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

  let score: number | undefined = data?.validationsSuccessRate?.percentage;
  score = score ? score * 100: undefined;

  const dynaPicturesEndpoint = 'https://dynapictures.com/b/rest/customer/designs/857ba510f9';
  const headers = {
    'Authorization': 'Bearer 31d61e0f72bf51e22101b8357a2434242a748c8bd0328883',
    'Content-Type': 'application/json',
    // Add any other required headers, such as an API key if needed
  };

  // Construct the payload for the DynaPictures API
  const payload = {
    format: "jpeg",
    metadata: "some text",
    params: [
      {
        name: "image2",
        imageUrl: "https://dynapictures.com/b/rest/public/media/a3caf5fa26/images/c302799f0c.png"
      },
      {
        name: "text3",
        text: `Validation success rate: ${score}%`
      }
    ]
  };

  // Make a POST request to the DynaPictures API
  const dynaPicturesResponse = await fetch(dynaPicturesEndpoint, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(payload)
  });

  if (!dynaPicturesResponse.ok) {
    throw new Error('Failed to generate image from DynaPictures');
  }

  const imageData = await dynaPicturesResponse.json();

  // Assuming the response includes a URL to the generated image
  const generatedImageUrl = imageData.imageUrl;

  return score ?  new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        {
          label: `Node ID: ${text}`,
        },
      ],
      image: {
        src: generatedImageUrl
      },
      postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
    }),
  ) : errorImage(text);
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
