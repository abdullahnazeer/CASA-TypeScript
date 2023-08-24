import { field, validators as r } from '@dwp/govuk-casa';

export default [
  field('biography').validators([
    r.required.make({
      errorMsg: 'biography:errorMessage',
    }),
    r.strlen.make({
      max: 100,
      errorMsgMax: 'biography:length',
    }),
  ]),
];
