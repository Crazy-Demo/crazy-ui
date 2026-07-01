import { describe, it, expect } from 'vitest';
import { useLocale } from '../src/context/use-locale';

describe('useLocale', () => {
  const messages = {
    common: { confirm: '确定', cancel: '取消' },
    input: { placeholder: '请输入' },
  };

  it('t() resolves simple path', () => {
    const { t } = useLocale(messages);
    expect(t('common.confirm')).toBe('确定');
  });

  it('t() returns path when key not found', () => {
    const { t } = useLocale(messages);
    expect(t('common.unknown')).toBe('common.unknown');
  });

  it('t() returns path when no locale provided', () => {
    const { t } = useLocale();
    expect(t('any.key')).toBe('any.key');
  });

  it('locale returns the provided messages', () => {
    const { locale } = useLocale(messages);
    expect(locale).toEqual(messages);
  });

  it('t() resolves nested path', () => {
    const { t } = useLocale(messages);
    expect(t('input.placeholder')).toBe('请输入');
  });
});
