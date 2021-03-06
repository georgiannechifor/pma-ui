import React from 'react';
import {usePagination, DOTS} from 'utils/usePagination';
import {ChevronLeftIcon, ChevronRightIcon} from '@heroicons/react/outline';
import {func, number} from 'prop-types';
import * as classNames from 'classnames';

const Pagination = ({onPageChange, totalCount, currentPage, pageSize, siblingCount}) => {
  const paginationRange = usePagination({currentPage,
    totalCount,
    siblingCount,
    pageSize});

  if (currentPage === 0 || paginationRange.length < 2) {
    return null;
  }
  const lastPage = paginationRange[paginationRange.length - 1];

  const onNext = () => {
    if (currentPage < lastPage) {
      onPageChange(currentPage + 1);
    }
  };

  const onPrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  return (
    <div className="w-full justify-center flex items-center my-5">
      <ChevronLeftIcon
        className={classNames('cursor-pointer w-6 mx-5 h-6 text-gray-500', {
          'cursor-auto text-gray-300' : currentPage === 1
        })}
        onClick={() => onPrevious()}
      />
      {paginationRange.map(index => {
        if (index === DOTS) {
          return <div> &#8230;</div>;
        }

        return (
          <div
            className={classNames('text-white select-none cursor-pointer hover:bg-indigo-500 w-7 h-7 flex items-center justify-center bg-indigo-400 rounded-full mx-2', {
              'bg-indigo-700' : currentPage === index
            })}
            key={index.toString()}
            onClick={() => onPageChange(index)}
          >
            {index}
          </div>
        );
      })}
      <ChevronRightIcon
        className={classNames('cursor-pointer w-6 mx-5 h-6 text-gray-500', {
          'cursor-auto text-gray-300' : currentPage === lastPage
        })}
        onClick={() => onNext()}
      />
    </div>
  );
};

Pagination.displayName = 'Pagination';
Pagination.propTypes = {
  onPageChange : func.isRequired,
  totalCount   : number.isRequired,
  currentPage  : number.isRequired,
  pageSize     : number,
  siblingCount : number
};
Pagination.defaultProps = {
  pageSize     : 10,
  siblingCount : 1
};

export default Pagination;
