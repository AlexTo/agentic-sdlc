import { Construct } from 'constructs';
import * as url from 'url';
import { StaticWebsite, StaticWebsiteProps } from '../../core/index.js';

export type NotesWebsiteProps = Omit<
  StaticWebsiteProps,
  'websiteName' | 'websiteFilePath'
>;

export class NotesWebsite extends StaticWebsite {
  constructor(scope: Construct, id: string, props?: NotesWebsiteProps) {
    super(scope, id, {
      ...props,
      websiteName: 'NotesWebsite',
      websiteFilePath: url.fileURLToPath(
        new URL(
          '../../../../../../dist/packages/notes-website/bundle',
          import.meta.url,
        ),
      ),
    });
  }
}
