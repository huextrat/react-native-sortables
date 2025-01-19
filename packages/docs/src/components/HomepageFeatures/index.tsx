import mountainSvg from '@site/static/img/undraw_docusaurus_mountain.svg';
import reactSvg from '@site/static/img/undraw_docusaurus_react.svg';
import treeSvg from '@site/static/img/undraw_docusaurus_tree.svg';
import Heading from '@theme/Heading';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import styles from './styles.module.css';

type FeatureItem = {
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  title: string;
};

const FeatureList: Array<FeatureItem> = [
  {
    Svg: mountainSvg,
    description: (
      <>
        Docusaurus was designed from the ground up to be easily installed and
        used to get your website up and running quickly.
      </>
    ),
    title: 'Easy to Use'
  },
  {
    Svg: treeSvg,
    description: (
      <>
        Docusaurus lets you focus on your docs, and we&apos;ll do the chores. Go
        ahead and move your docs into the <code>docs</code> directory.
      </>
    ),
    title: 'Focus on What Matters'
  },
  {
    Svg: reactSvg,
    description: (
      <>
        Extend or customize your website layout by reusing React. Docusaurus can
        be extended while reusing the same header and footer.
      </>
    ),
    title: 'Powered by React'
  }
];

function Feature({ Svg, description, title }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className='text--center'>
        <Svg className={styles.featureSvg} role='img' />
      </div>
      <div className='text--center padding-horiz--md'>
        <Heading as='h3'>{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className='container'>
        <div className='row'>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
