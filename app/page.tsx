import { getFrameMetadata } from '@coinbase/onchainkit';
import type { Metadata } from 'next';
import { NEXT_PUBLIC_URL } from './config';

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: 'Submit',
    },
/*     {
      action: 'link',
      label: 'Link to Validator detail',
      target: 'https://avascan.info',
    }, */
  ],
  image: {
    src: `https://avascan.info/cdn/og-image.png`,
  },
  input: {
    text: 'Insert Node ID',
  },
  postUrl: `${NEXT_PUBLIC_URL}/api/frame`,
});

export const metadata: Metadata = {
  title: 'Validator',
  description: 'Validator desc',
  other: {
    ...frameMetadata,
  },
};

export default function Page() {
  return (
    <></>
  );
}
