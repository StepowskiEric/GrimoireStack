import { Composition } from 'remotion';
import { BookCover } from './BookCover';
import { WitchDoctorIdle } from './WitchDoctorIdle';
import { WitchDoctorReveal } from './WitchDoctorReveal';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="BookCover"
        component={BookCover}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WitchDoctorIdle"
        component={WitchDoctorIdle}
        durationInFrames={150}
        fps={30}
        width={400}
        height={600}
      />
      <Composition
        id="WitchDoctorReveal"
        component={WitchDoctorReveal}
        durationInFrames={90}
        fps={30}
        width={400}
        height={600}
      />
    </>
  );
};
