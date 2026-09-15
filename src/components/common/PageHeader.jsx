
function PageHeader({
  title,
  description,
  action,
  breadcrumb,
}) {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {breadcrumb && (
          <div className="breadcrumb">
            {breadcrumb}
          </div>
        )}

        <h2>{title}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {action && (
        <div className="page-header-action">
          {action}
        </div>
      )}
    </div>
  );
}

export default PageHeader;

