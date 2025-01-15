import InboundUserJobAdapter from '@adapters/inbound/http/job/InboundUserJobAdapter';
import OutboundUserRepositoryPort from '@ports/outbound/postgresql/user/OutboundUserRepositoryPort';

describe('InboundUserJobAdapter', () => {
  let inboundUserJobAdapter: InboundUserJobAdapter;
  let outboundUserRepositoryPortMock: jest.Mocked<OutboundUserRepositoryPort>;

  const traceId = 'test-trace-id';

  beforeEach(() => {
    // Mock the OutboundUserRepositoryPort methods
    outboundUserRepositoryPortMock = {
      findAllLogicallyDeletedUsersMoreThan1MonthAgo: jest.fn(),
      physicalDelete: jest.fn(),
    } as unknown as jest.Mocked<OutboundUserRepositoryPort>;

    inboundUserJobAdapter = new InboundUserJobAdapter(outboundUserRepositoryPortMock);
  });

  it('should delete all logically deleted users physically', async () => {
    // Mocking the repository response with logically deleted users
    const logicallyDeletedUsers = [
      { id: 1, username: 'user1', password: 'password1', email: 'user1@example.com', is_deleted: true, btc_balance: 0, brl_balance: 0 , photo_url: 'photo_url' },
      { id: 2, username: 'user2', password: 'password2', email: 'user2@example.com', is_deleted: true, btc_balance: 0, brl_balance: 0, photo_url: 'photo_url' },
    ];
    
    outboundUserRepositoryPortMock.findAllLogicallyDeletedUsersMoreThan1MonthAgo.mockResolvedValue(logicallyDeletedUsers);

    // Run the method under test
    await inboundUserJobAdapter.deletePhysicallyAllLogicallyDeletedUsers(traceId);

    // Verify that the repository methods were called correctly
    expect(outboundUserRepositoryPortMock.findAllLogicallyDeletedUsersMoreThan1MonthAgo).toHaveBeenCalled();
    expect(outboundUserRepositoryPortMock.physicalDelete).toHaveBeenCalledTimes(logicallyDeletedUsers.length);
    expect(outboundUserRepositoryPortMock.physicalDelete).toHaveBeenCalledWith(logicallyDeletedUsers[0].id);
    expect(outboundUserRepositoryPortMock.physicalDelete).toHaveBeenCalledWith(logicallyDeletedUsers[1].id);
  });

  it('should log when no logically deleted users are found', async () => {
    // Mocking the repository response with no users
    outboundUserRepositoryPortMock.findAllLogicallyDeletedUsersMoreThan1MonthAgo.mockResolvedValue([]);

    // Spy on the log method
    const logInfoSpy = jest.spyOn(inboundUserJobAdapter['log'], 'info');

    // Run the method under test
    await inboundUserJobAdapter.deletePhysicallyAllLogicallyDeletedUsers(traceId);

    // Ensure that the log shows that no users were found
    expect(logInfoSpy).toHaveBeenCalledWith('Found 0 logically deleted users to be physically deleted', traceId);
    expect(outboundUserRepositoryPortMock.physicalDelete).not.toHaveBeenCalled();
  });
});
