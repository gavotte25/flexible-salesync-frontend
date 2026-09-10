interface Window {
  React: typeof import('react');
  ReactDOM: any;
  __miscCloudHostUI__: {
    Button: typeof import('../components/ui').Button;
    Panel: typeof import('../components/ui').Panel;
    RecordTable: typeof import('../components/Records/RecordTable').default;
    Tooltip: typeof import('../components/ui').Tooltip;
    TextInput: typeof import('../components/ui').TextInput;
    Select: typeof import('../components/ui/select').Select;
    SelectTrigger: typeof import('../components/ui/select').SelectTrigger;
    SelectValue: typeof import('../components/ui/select').SelectValue;
    SelectContent: typeof import('../components/ui/select').SelectContent;
    SelectItem: typeof import('../components/ui/select').SelectItem;
    LoadingSpinnerSmall: typeof import('../components/ui/Loading/LoadingSpinnerSmall').default;
  };
  __miscCloudCustomizations__?: Record<string, import('react').ComponentType<any>>;
}
