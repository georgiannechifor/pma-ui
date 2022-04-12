import {useState, useEffect, useMemo} from 'react';
import {array} from 'prop-types';
import map from 'lodash/map';
import size from 'lodash/size';
import slice from 'lodash/slice';
import filter from 'lodash/filter';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import classnames from 'classnames';
import {Table, Modal, Select, Loader, Pagination} from 'components';
import {getPropsFromFetch} from 'utils/getPropsFromFetch';
import {useFetch} from 'utils/useFetch';
import useSWR, {useSWRConfig} from 'swr';
import {teamsColumns, PAGE_SIZE} from 'constants/index';

// eslint-disable-next-line complexity
const AdminTeams = ({defaultTeams, defaultUsers}) => {
  const {data: teams} = useSWR('/teams', {
    initialData : defaultTeams
  });
  const {data: users} = useSWR('/users', {
    initialData : defaultUsers
  });
  const {mutate} = useSWRConfig();

  const formSchema = Yup.object().shape({
    teamName : Yup.string().required('Team Name is required'),
    admin    : Yup.string().required('Team Admin is required')
  });
  const validationOptions = {resolver : yupResolver(formSchema)};

  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false);
  const [editTeamModalOpen, setEditTeamModalOpen] = useState(false);
  const [editTeamItem, setEditTeamItem] = useState({});
  const [selectedTeamAdmin, setSelectedTeamAdmin] = useState({});

  const {
    result: {data, loading, error},
    fetchData
  } = useFetch('teams');
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: {errors}
  } = useForm(validationOptions);

  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedTeams, setPaginatedTeams] = useState(teams);

  useMemo(() => {
    const firstPageIndex = (currentPage - 1) * PAGE_SIZE;
    const lastPageIndex = firstPageIndex + PAGE_SIZE;

    setPaginatedTeams(slice(teams, firstPageIndex, lastPageIndex));
  }, [currentPage, teams]);

  const onSubmit = formdata => {
    if (editTeamModalOpen) {
      fetchData({
        // eslint-disable-next-line no-underscore-dangle
        entityId : editTeamItem._id,
        method   : 'PUT',
        data     : {
          name  : formdata.teamName,
          admin : formdata.admin
        }
      });
    } else {
      fetchData({
        method : 'POST',
        data   : {
          name  : formdata.teamName,
          admin : formdata.admin
        }
      });
    }
  };

  useEffect(() => {
    if (data && data.name) {
      setCreateTeamModalOpen(false);
      setEditTeamModalOpen(false);
      setSelectedTeamAdmin({});
      reset({
        teamName : '',
        admin    : ''
      });
      mutate('/teams');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <Loader isLoading={loading}>
      <div className="w-11/12 mx-auto flex flex-col">
        <section className="flex items-center justify-between">
          <h1 className="text-xl font-medium py-4"> Company Teams </h1>
          <button
            className="px-5 py-2 bg-indigo-600 rounded text-white font-medium text-md hover:bg-indigo-700 transition"
            onClick={() => setCreateTeamModalOpen(true)}
          >
            Create Team
          </button>
        </section>

        <div className="flex-1">
          <Table
            columns={teamsColumns}
            data={map(paginatedTeams, item => ({
              ...item,
              admin : {
                ...item.admin,
                fullName : item.admin.firstName + ' ' + item.admin.lastName
              }
            }))}
            onRowClick={item => {
              setEditTeamItem(item);
              setSelectedTeamAdmin({
                name  : item.admin.fullName,
                value : item.admin._id // eslint-disable-line no-underscore-dangle
              });
              // eslint-disable-next-line no-underscore-dangle
              setValue('admin', item.admin._id);
              setValue('teamName', item.name);
              setEditTeamModalOpen(true);
            }}
          />
        </div>

        <Modal
          isModalOpen={createTeamModalOpen || editTeamModalOpen}
          modalActions={
            <div className="flex w-full items-center justify-end gap-2">
              <button
                className="px-4 py-2 text-sm font-medium focus:border-none focus:outline-none hover:text-gray-400 transition"
                onClick={() => {
                  setCreateTeamModalOpen(false);
                  setEditTeamModalOpen(false);
                }}
              >
                Cancel
              </button>
              <button className="px-8 py-2 text-sm text-white font-medium bg-blue-500 rounded-lg" onClick={handleSubmit(onSubmit)}>
                Save
              </button>
            </div>
          }
          modalContent={
            <div>
              <input
                {...register('teamName')}
                className={classnames('text-sm placeholder-gray-500 rounded-lg border border-gray-400 w-full py-2 px-4 focus:outline-none', {
                  'border-1 border-red-400' : errors.teamName
                })}
                placeholder="Team Name"
                type="text"
              />
              {errors && errors.teamName && <p className="my-1 text-red-500 text-xs font-medium"> {errors.teamName.message}</p>}

              <div className="mt-5">
                <Select
                  errorClassname={errors.admin ? 'border-1 border-red-400' : ''}
                  options={map(
                    filter(users, user => user.team?._id === editTeamItem?._id), // eslint-disable-line no-underscore-dangle
                    user => ({
                      // eslint-disable-next-line no-underscore-dangle
                      value : user._id,
                      name  : user.firstName + ' ' + user.lastName
                    })
                  )}
                  placeholder="Select a team admin"
                  selected={selectedTeamAdmin}
                  setSelected={event => {
                    setSelectedTeamAdmin(event);
                    setValue('admin', event.value, {
                      shouldValidate : true
                    });
                  }}
                />
              </div>
              {errors && errors.admin && <p className="my-1 text-red-500 text-xs font-medium"> {errors.admin?.message}</p>}

              {error && error.message && <p className="my-1 text-red-500 text-xs font-medium"> {error.message}</p>}
            </div>
          }
          modalTitle="Create Team"
          setIsModalOpen={setCreateTeamModalOpen}
        />

        <div className="w-full">
          <Pagination
            currentPage={currentPage} onPageChange={page => setCurrentPage(page)} pageSize={PAGE_SIZE}
            totalCount={size(paginatedTeams)}
          />
        </div>
      </div>
    </Loader>
  );
};

AdminTeams.getInitialProps = async ctx => {
  try {
    const {data: teams} = await getPropsFromFetch('/teams', ctx);
    const {data: users} = await getPropsFromFetch('/users', ctx);

    return {
      defaultTeams : teams,
      defaultUsers : users
    };
  } catch {
    return {};
  }
};

AdminTeams.displayName = 'AdminTeams';
AdminTeams.propTypes = {
  defaultTeams : array.isRequired,
  defaultUsers : array.isRequired
};

export default AdminTeams;
