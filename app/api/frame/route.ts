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

  let scoreval = data?.validationsSuccessRate?.percentage;
  scoreval = scoreval ? parseFloat((scoreval * 100).toFixed(2)) : undefined;
  let numval: number | undefined = data?.validationsSuccessRate?.total;
  numval = numval ? numval : undefined;
  let scoredel: number | undefined = data?.delegationsSuccessRate?.percentage;
  scoredel = scoredel ? parseFloat((scoredel * 100).toFixed(2)): undefined;
  let numdel: number | undefined = data?.delegationsSuccessRate?.total;
  numdel = numdel ? numdel : undefined;
  let activedel: number | undefined = data?.activeDelegations?.count;
  activedel = activedel;
  let feedel: number | undefined = data?.activeDelegations?.feePercentage;
  feedel = feedel ? feedel * 100: undefined;
  let maxyield: number | undefined = data?.activeDelegations?.maxYield;
  maxyield = maxyield ? parseFloat((maxyield *  100).toFixed(2)): undefined;
  let avgresp: number | undefined = data?.activeValidation?.averageResponse;
  avgresp = avgresp ? parseFloat((avgresp * 100).toFixed(2)): undefined;
  let potentialRewardData = data?.activeValidation?.potentialReward;
  let potrew = potentialRewardData && potentialRewardData.value;
  potrew = parseFloat((potrew /   1000000000).toFixed(2));

  let timeleft = data?.activeValidation?.timeLeft;
  function convertMillisecondsToDaysAndHours(milliseconds: number) {
    const totalSeconds = Math.floor(milliseconds /  1000);
    const totalMinutes = Math.floor(totalSeconds /  60);
    const totalHours = Math.floor(totalMinutes /  60);
    const days = Math.floor(totalHours /  24);
    const hours = totalHours %  24;
  
    return `${days} days and ${hours} hours`;
  }
  
  const formattedTime = convertMillisecondsToDaysAndHours(timeleft);

  const QuickChart = require('quickchart-js');

  const chart = new QuickChart();

  chart.setWidth(500)
  chart.setHeight(300);
  chart.setVersion('2.9.4');

  chart.setConfig({
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [scoreval,100-scoreval],
          backgroundColor: ['green', '#ffffff'],
          label: 'Dataset 1',
          borderWidth: 0,
        },
      ],
      labels: ['A', 'C'],
    },
    options: {
      circumference: Math.PI,
      rotation: Math.PI,
      cutoutPercentage: 75,
      layout: {
        padding: 40,
      },
      legend: {
        display: false,
      },
      plugins: {
        datalabels: {
          color: '#ffffff',
          anchor: 'end',
          align: 'end',
          formatter: (val: string | number) => val + '%',
          font: {
            size: 18,
            weight: 'bold',
          },
        },
        doughnutlabel: {
          labels: [
            {
              text: '\nValidation Success rate\n\n\n\n\nTotal validations:',
              color: '#ffffff',
              font: {
                size: 18,
              },
            },
            {
             text: '\n\n\n\n\n20',
              color: '#ffffff',
              font: {
                size: 25,
                weight: 'bold',
              },
            },
          ],
        },
      },
    },
  });

// Print the chart URL
  const testurl = (chart.getUrl({ backgroundColor: '#381E72' }));

  const generatedImageUrl = testurl
      
  return scoreval ?  new NextResponse(
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
