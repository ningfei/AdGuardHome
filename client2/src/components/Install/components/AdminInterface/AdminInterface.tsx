import React, { FC, useContext } from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import { FormikHelpers } from 'formik';

import { Input, Radio, Switch } from 'Common/controls';
import { DEFAULT_IP_ADDRESS } from 'Consts/install';
import { chechNetworkType, NETWORK_TYPE } from 'Helpers/installHelpers';
import theme from 'Lib/theme';
import Store from 'Store/installStore';

import s from './AdminInterface.module.pcss';
import { FormValues } from '../../Install';
import StepButtons from '../StepButtons';

enum NETWORK_OPTIONS {
    ALL = 'all',
    CUSTOM = 'custom',
}

interface AdminInterfaceProps {
    values: FormValues;
    setFieldValue: FormikHelpers<FormValues>['setFieldValue'];
}

const AdminInterface: FC<AdminInterfaceProps> = observer(({
    values,
    setFieldValue,
}) => {
    const { ui: { intl }, install: { addresses } } = useContext(Store);
    const { web: { ip } } = values;
    const radioValue = ip.length === 1 && ip[0] === DEFAULT_IP_ADDRESS
        ? NETWORK_OPTIONS.ALL : NETWORK_OPTIONS.CUSTOM;

    const onSelectRadio = (v: string | number) => {
        const value = v === NETWORK_OPTIONS.ALL
            ? [DEFAULT_IP_ADDRESS] : [];
        setFieldValue('web.ip', value);
    };

    const getManualBlock = () => (
        <div className={s.manualOptions}>
            {addresses?.interfaces.map((a) => {
                let name = '';
                const type = chechNetworkType(a.name);
                switch (type) {
                    case NETWORK_TYPE.ETHERNET:
                        name = `${intl.getMessage('ethernet')} (${a.name}) `;
                        break;
                    case NETWORK_TYPE.LOCAL:
                        name = `${intl.getMessage('localhost')} (${a.name}) `;
                        break;
                    default:
                        name = a.name || '';
                        break;
                }
                const currentIp = a.ipAddresses ? a.ipAddresses[0] : '';
                const isChecked = values.web.ip.includes(currentIp);
                return (
                    <div key={a.name} className={s.manualOption}>
                        <div>
                            <div>
                                {name}
                            </div>
                            {a.ipAddresses?.map((addrIp) => (
                                <div className={theme.typo.subtext} key={addrIp}>
                                    http://{addrIp}
                                </div>
                            ))}
                        </div>
                        <Switch checked={isChecked} onChange={() => {
                            const temp = new Set(ip);
                            if (temp.has(currentIp)) {
                                temp.delete(currentIp);
                            } else {
                                temp.add(currentIp);
                            }
                            setFieldValue('web.ip', Array.from(temp.values()));
                        }}/>
                    </div>
                );
            })}
        </div>
    );

    return (
        <div className={s.content}>
            <div className={theme.typo.title}>
                {intl.getMessage('install_admin_interface_title')}
            </div>
            <div className={cn(theme.typo.text, theme.typo.text_block)}>
                {intl.getMessage('install_admin_interface_title_decs')}
            </div>
            <div className={theme.typo.subTitle}>
                {intl.getMessage('install_admin_interface_where_interface')}
            </div>
            <div className={cn(theme.typo.text, theme.typo.text_base)}>
                {intl.getMessage('install_admin_interface_where_interface_desc')}
            </div>
            <Radio
                value={radioValue}
                onSelect={onSelectRadio}
                options={[
                    {
                        value: NETWORK_OPTIONS.ALL,
                        label: intl.getMessage('install_all_networks'),
                        desc: intl.getMessage('install_all_networks_description'),
                    },
                    {
                        value: NETWORK_OPTIONS.CUSTOM,
                        label: intl.getMessage('install_choose_networks'),
                        desc: intl.getMessage('install_choose_networks_desc'),
                    },
                ]}
            />
            { radioValue !== NETWORK_OPTIONS.ALL && getManualBlock()}
            <div className={theme.typo.subTitle}>
                {intl.getMessage('install_admin_interface_port')}
            </div>
            <div className={cn(theme.typo.text, theme.typo.text_base)}>
                {intl.getMessage('install_admin_interface_port_desc')}
            </div>
            <Input
                label={`${intl.getMessage('port')}:`}
                placeholder={intl.getMessage('port')}
                type="number"
                name="webPort"
                value={values.web.port}
                onChange={(v) => {
                    const port = v === '' ? '' : parseInt(v, 10);
                    setFieldValue('web.port', port);
                }}
            />
            <StepButtons
                setFieldValue={setFieldValue}
                currentStep={1}
                values={values}
            />
        </div>
    );
});

export default AdminInterface;
