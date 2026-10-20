// title only
<DashboardLayout title="Dashboard">...</DashboardLayout>

// title + subtitle
<DashboardLayout title="Dashboard" subtitle="Overview of this month">...</DashboardLayout>

// breadcrumb + buttons
<DashboardLayout
  title={['Invoice', 'New']}
  actions={
    <>
      <Button size="xs" color="orange" radius="xs">Save</Button>
      <Button size="xs" color="gray.7" radius="xs">Discard</Button>
    </>
  }
>
  ...
</DashboardLayout>

// title + subtitle + a single control
<DashboardLayout
  title="Projects"
  subtitle="12 active"
  actions={<Button size="xs" color="gray.7" radius="xs">Date Filter</Button>}
>
  ...
</DashboardLayout>