import { Composition } from 'remotion';
import { BookCover } from './BookCover';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="BookCover"
      component={BookCover}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
