import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as staicoinIcon } from './images/staicoin.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={staicoinIcon} viewBox="0 0 150 58" {...props} />;
}
