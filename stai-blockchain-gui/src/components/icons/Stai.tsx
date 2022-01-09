import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import { ReactComponent as StaiIcon } from './images/stai.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={StaiIcon} viewBox="0 0 155 60" {...props} />;
}
