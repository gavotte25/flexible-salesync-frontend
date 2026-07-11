import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { utils, writeFile } from 'xlsx';
import { Download } from 'lucide-react';
import useTenant from '@/hooks/useTenant';
import useAuth from '@/hooks/useAuth';
import useType from '@/hooks/type-service/useType';
import useProperties from '@/hooks/type-service/useProperties';
import useRecords from '@/hooks/record-service/useRecords';
import RecordTable from '@/components/Records/RecordTable';
import { RecordsFilter } from '@/api/record';
import Button from '@/components/ui/Button/Button';
import TextInput from '@/components/ui/TextInput/TextInput';
import Panel from '@/components/ui/Panel/Panel';
import LoadingSpinnerSmall from '@/components/ui/Loading/LoadingSpinnerSmall';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// No pagination on export: fetch the full search result in one call to the existing API.
const EXPORT_PAGE_SIZE = 10000;

type ExportableRecord = {
  name: string;
  properties: {
    property_label: string | null;
    item_value: string | null;
  }[];
};

const CsvExport = () => {
  const companyName = useTenant();
  const { hasPermission } = useAuth();
  const { types } = useType(companyName);
  const [searchParams] = useSearchParams();
  const [selectedTypeId, setSelectedTypeId] = useState<string | undefined>(searchParams.get('typeId') ?? undefined);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [canExport, setCanExport] = useState(false);

  useEffect(() => {
    const checkPermission = async () => {
      const readOwn = await hasPermission('read-own');
      const readAll = await hasPermission('read-all');
      setCanExport(readOwn || readAll);
    };
    checkPermission();
  }, [hasPermission]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const selectedType = types?.find((type) => type.id === selectedTypeId);

  const recordFilter: RecordsFilter = {
    searchTerm: debouncedSearch,
    isAsc: null,
    propertyName: null,
    currentPage: 1,
    pageSize: EXPORT_PAGE_SIZE
  };

  const propertiesQuery = useProperties(companyName, selectedTypeId);
  const recordsQuery = useRecords(companyName, selectedTypeId ?? '', recordFilter, true);

  if (!canExport) {
    return (
      <Panel className='m-4 p-6'>
        <p>You don&apos;t have permission to export this data.</p>
      </Panel>
    );
  }

  const handleExport = () => {
    if (!selectedType) {
      return;
    }
    const records: ExportableRecord[] = recordsQuery.data?.records ?? [];
    const rows = records.map((record) => {
      const row: Record<string, string> = { Name: record.name };
      record.properties.forEach((property) => {
        if (property.property_label) {
          row[property.property_label] = property.item_value ?? '';
        }
      });
      return row;
    });

    const worksheet = utils.json_to_sheet(rows);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, 'Data');

    const fileName = `${selectedType.name.toLowerCase()}-${new Date().toISOString().split('T')[0]}.csv`;
    writeFile(workbook, fileName);
  };

  return (
    <Panel className='m-4 mt-20 flex min-h-[calc(100dvh-96px)] flex-col overflow-auto p-4'>
      <section className='flex flex-col gap-4 pt-4'>
        <h1 className='text-[1.3rem]'>Export to CSV</h1>
        <div className='flex items-center gap-2'>
          <Select value={selectedTypeId} onValueChange={setSelectedTypeId}>
            <SelectTrigger className='w-64'>
              <SelectValue placeholder='Select a record type' />
            </SelectTrigger>
            <SelectContent>
              {types?.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedType && (
            <>
              <TextInput
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search records...'
                prefixIcon='search'
              />
              <Button
                intent='normal'
                zoom={false}
                className='space-x-2'
                onClick={handleExport}
                disabled={recordsQuery.isLoading}
              >
                {recordsQuery.isLoading ? (
                  <LoadingSpinnerSmall className='h-[1.2rem] w-[1.2rem]' />
                ) : (
                  <Download size='1rem' />
                )}
                <p>Export CSV</p>
              </Button>
            </>
          )}
        </div>
        {selectedType ? (
          <p className='text-sm text-muted-foreground'>
            {recordsQuery.isLoading ? 'Loading...' : `${recordsQuery.data?.records?.length ?? 0} record(s) match your search.`}
          </p>
        ) : (
          <p className='text-sm text-muted-foreground'>Select a record type to preview and export its data.</p>
        )}
      </section>
      {selectedType && (
        <div className='-mx-4 mt-4 flex-grow'>
          <RecordTable
            typeId={selectedType.id}
            recordsQuery={recordsQuery}
            propertiesQuery={propertiesQuery}
            recordFilter={recordFilter}
          />
        </div>
      )}
    </Panel>
  );
};

export default CsvExport;
